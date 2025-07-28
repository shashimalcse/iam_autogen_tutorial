"""
 Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.

  This software is the property of WSO2 LLC. and its suppliers, if any.
  Dissemination of any information or reproduction of any material contained
  herein is strictly forbidden, unless permitted by WSO2 in accordance with
  the WSO2 Commercial License available at http://wso2.com/licenses.
  For specific language governing the permissions and limitations under
  this license, please see the license as well as any agreement you’ve
  entered into with WSO2 governing the purchase of this software and any
"""

import logging
import os
import uuid
import asyncio
from typing import Literal, Dict

from fastapi.responses import HTMLResponse

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken
from autogen_ext.models.openai import AzureOpenAIChatCompletionClient
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
from starlette.responses import HTMLResponse
from starlette.websockets import WebSocketDisconnect

from app.prompt import agent_system_prompt, admin_agent_system_prompt
from app.tools import (
    fetch_hotels, fetch_hotel_details, make_booking, search_hotels, fetch_hotel_reviews,
    get_review, fetch_reviews,
    update_booking_admin, get_available_staff, get_booking_admin
)
from autogen.tool import SecureFunctionTool
from auth import AuthRequestMessage, AutogenAuthManager, AuthSchema, AuthConfig, OAuthTokenType

from asgardeo_ai.models import AgentConfig
from asgardeo.auth.models import ServerConfig, ClientConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Asgardeo related configurations
client_id = os.environ.get('ASGARDEO_CLIENT_ID')
client_secret = os.environ.get('ASGARDEO_CLIENT_SECRET')
base_url = os.environ.get('ASGARDEO_BASE_URL')
redirect_uri = os.environ.get('ASGARDEO_REDIRECT_URI', 'http://localhost:8000/callback')

# Interactive booking agent configurations
agent_id = os.environ.get('AGENT_ID')
agent_name = os.environ.get('AGENT_NAME')
agent_secret = os.environ.get('AGENT_SECRET')

# Background assignment agent configurations (separate identity)
background_agent_id = os.environ.get('BACKGROUND_AGENT_ID')
background_agent_name = os.environ.get('BACKGROUND_AGENT_NAME')
background_agent_secret = os.environ.get('BACKGROUND_AGENT_SECRET')
background_agent_enabled = os.environ.get('BACKGROUND_AGENT_ENABLED', 'false').lower() == 'true'

server_config = ServerConfig(
    base_url=base_url
)

client_config = ClientConfig(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri
)

# Interactive booking agent config
agent_config = AgentConfig(
    agent_id=agent_id,
    agent_name=agent_name,
    agent_secret=agent_secret,
)

# Background assignment agent config (separate identity)
background_agent_config = AgentConfig(
    agent_id=background_agent_id,
    agent_name=background_agent_name,
    agent_secret=background_agent_secret,
)

# Azure OpenAI configs
azure_openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
deployment_name = os.environ.get('AZURE_OPENAI_DEPLOYMENT_NAME')
azure_openai_api_version = os.environ.get('AZURE_OPENAI_API_VERSION')

app = FastAPI()


class TextResponse(BaseModel):
    type: Literal["message"] = "message"
    content: str

class AutoAssignWebhook(BaseModel):
    event_type: str
    booking_id: int
    user_id: str
    hotel_id: int
    priority: str = "normal"
    timestamp: str
    source: str = "hotel_api"

class WebhookResponse(BaseModel):
    task_id: str
    status: str
    message: str
    estimated_completion: str


model_client = AzureOpenAIChatCompletionClient(
    azure_deployment=deployment_name,
    api_version=azure_openai_api_version,
    azure_endpoint=azure_openai_endpoint,
    model="gpt-4o"
)

auth_managers: Dict[str, AutogenAuthManager] = {}
state_mapping: Dict[str, str] = {}


async def run_agent(assistant: AssistantAgent, websocket: WebSocket):
    # Start the chat loop
    while True:
        user_input = await websocket.receive_text()

        if user_input.strip().lower() == "exit":
            await websocket.close()
            break

        # Send the user message to the agent
        response = await assistant.on_messages(
            [TextMessage(content=user_input, source="user")], cancellation_token=CancellationToken())

        # Log the response
        for i, msg in enumerate(response.inner_messages):
            print(f"Step {i + 1}: {msg.content}")
        print(f"Final Response: {response.chat_message.content}")

        # Send the response back to the client
        await websocket.send_json(TextResponse(content=response.chat_message.content).model_dump())

async def run_background_agent_for_assignment(webhook_data: AutoAssignWebhook, task_id: str) -> None:
    """Create and run a background agent for contact person assignment"""
    try:
        logger.info(f"Starting background agent task {task_id} for booking {webhook_data.booking_id}")
        
        # Check if background agent config is available
        if background_agent_config is None:
            logger.error(f"Background agent not configured. Task {task_id} cannot proceed.")
            raise Exception("Background agent credentials not configured")
        
        # Create a background auth manager instance with separate agent identity
        background_auth_manager = AutogenAuthManager(
            server_config=server_config,
            client_config=client_config,
            agent_config=background_agent_config,  # Use separate background agent config
            message_handler=None  # No message handler for background tasks
        )
        
        
        get_booking_admin_tool = SecureFunctionTool(
            get_booking_admin,
            description="Get the booking information by booking ID",
            name="GetBookingByIdTool",
            auth=AuthSchema(background_auth_manager, AuthConfig(
                scopes=["admin_read_bookings"],
                token_type=OAuthTokenType.AGENT_TOKEN,
                resource="booking_api"
            ))
        )
        
        update_booking_tool = SecureFunctionTool(
            update_booking_admin,
            description="Assign Contact Person by Updating the booking",
            name="UpdateBookingTool",
            auth=AuthSchema(background_auth_manager, AuthConfig(
                scopes=["admin_update_bookings"],
                token_type=OAuthTokenType.AGENT_TOKEN,
                resource="booking_api"
            ))
        )
        
        get_available_staff_tool = SecureFunctionTool(
            get_available_staff,
            description="Get available staff for booking assignments",
            name="GetAvailableStaffTool",
            auth=AuthSchema(background_auth_manager, AuthConfig(
                scopes=["admin_read_staff"],
                token_type=OAuthTokenType.AGENT_TOKEN,
                resource="booking_api"
            ))
        )
    
        # Create a specialized agent for assignment tasks
        assignment_agent = AssistantAgent(
            "hotel_admin_assistant",
            model_client=model_client,
            tools=[
                get_booking_admin_tool,
                get_available_staff_tool,
                update_booking_tool,
            ],
            reflect_on_tool_use=True,
            system_message=admin_agent_system_prompt,
            max_tool_iterations=20,
            )

        response = await asyncio.wait_for(
            assignment_agent.run(
                task=f"Assign contact person for booking id : {webhook_data.booking_id} , hotel id : {webhook_data.hotel_id}"
            ),
            timeout=300  # 5 minutes timeout
        )

        print(response.messages)
        print(f"Final Response: {response.messages[-1].content}")

        logger.info(f"Background agent task {task_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Background agent task {task_id} failed: {str(e)}", exc_info=True)     

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for chat functionality"""

    # Create callback function to handle auth request redirects
    async def message_handler(message: AuthRequestMessage):
        state_mapping[message.state] = session_id
        await websocket.send_json(message.model_dump())

    # Create autogen auth manager instance for the chat session.
    # Auth manager is shared by all the tools in the session.
    auth_manager = AutogenAuthManager(
        server_config=server_config,
        client_config=client_config,
        agent_config=agent_config,
        message_handler=message_handler,
    )

    # Store the auth manager by session_id
    auth_managers[session_id] = auth_manager

    # Create the set of tools required
    
    fetch_hotels_tool = SecureFunctionTool(
        fetch_hotels,
        description="Fetches all hotels with optional filters (city, brand, amenities, etc.)",
        name="FetchHotelsTool"
    )
    
    search_hotels_tool = SecureFunctionTool(
        search_hotels,
        description="Search hotels with availability for specific dates and location",
        name="SearchHotelsTool"
    )

    fetch_hotel_details_tool = SecureFunctionTool(
        fetch_hotel_details,
        description="Fetch detailed information about a specific hotel including rooms",
        name="FetchHotelDetailsTool"
    )
    
    fetch_hotel_reviews_tool = SecureFunctionTool(
        fetch_hotel_reviews,
        description="Fetch reviews for a specific hotel",
        name="FetchHotelReviewsTool"
    )
    
    fetch_reviews_tool = SecureFunctionTool(
        fetch_reviews,
        description="Fetch all reviews with optional filters",
        name="FetchReviewsTool"
    )
    
    get_review_tool = SecureFunctionTool(
        get_review,
        description="Get details of a specific review",
        name="GetReviewTool"
    )

    book_hotel_tool = SecureFunctionTool(
        make_booking,
        description="Books the hotel room selected by the user",
        name="BookHotelTool",
        auth=AuthSchema(auth_manager, AuthConfig(
            scopes=["create_bookings"],
            token_type=OAuthTokenType.OBO_TOKEN,
            resource="booking_api"
        ))
    )
    
    # Create a agent instance for the chat session
    hotel_assistant = AssistantAgent(
        "hotel_booking_assistant",
        model_client=model_client,
        tools=[
            # Public Hotel Tools
            fetch_hotels_tool,
            search_hotels_tool, 
            fetch_hotel_details_tool,
            fetch_hotel_reviews_tool,
            # Public Review Tools
            fetch_reviews_tool,
            get_review_tool,
            # Protected Booking Tools
            book_hotel_tool,

        ],
        reflect_on_tool_use=True,
        system_message=agent_system_prompt)

    # Initiate a web-socket connection
    await websocket.accept()

    try:
        # Welcome message
        await websocket.send_json(TextResponse(
            content="Welcome to Gardeo Hotel Booking! How can I help you today?"
        ).model_dump())

        # Continue to run the agent
        await run_agent(hotel_assistant, websocket)
    except WebSocketDisconnect:
        print(f"Client with session_id {session_id} disconnected")
    except Exception as e:
        print(f"Error in WebSocket connection: {str(e)}")
    finally:
        auth_managers.pop(session_id, None)


@app.get("/callback")
async def callback(
        code: str,
        state: str):
    # Check if the state is valid
    session_id = state_mapping.pop(state, None)
    if not session_id:
        raise HTTPException(status_code=400, detail="Invalid state.")

    # Get the auth manager for the session
    auth_manager = auth_managers.get(session_id)
    if not auth_manager:
        raise HTTPException(status_code=400, detail="Invalid session.")

    try:
        token = await auth_manager.process_callback(state, code)

        return HTMLResponse(
            content=f"""
            <html>
            <head>
                <title>Authorization Successful</title>
                <script>
                    function communicateAndClose() {{
                        if (window.opener) {{
                            try {{
                                const message = {{
                                    type: 'auth_callback',
                                    token: {token.model_dump_json()},
                                    state: '{state}'
                                }};

                                // Use postMessage to send token to opener
                                window.opener.postMessage(message, "*");

                                // Show success message
                                document.getElementById('status').textContent = 'Authorization successful! Closing window...';

                                // Close the window after a short delay
                                setTimeout(function() {{
                                    window.close();
                                }}, 1500);
                            }} catch (err) {{
                                console.error('Error communicating with parent window:', err);
                                document.getElementById('status').textContent = 'Error: ' + err.message;
                            }}
                        }} else {{
                            document.getElementById('status').textContent = 'Cannot find opener window.';
                        }}
                    }}

                    window.onload = communicateAndClose;
                </script>
            </head>
            <body>
                <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
                    <h2>Authorization Successful</h2>
                    <p id="status">Processing authorization...</p>
                    <p>You can close this window and return to the booking assistant.</p>
                </div>
            </body>
            </html>
            """
        )
    except Exception as e:
        logger.error(f"Error in callback: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

from app.dependencies import validate_token, TokenData
from fastapi import Security

@app.post("/webhook/auto-assign")
async def auto_assign_webhook(webhook_data: AutoAssignWebhook, token_data: TokenData = Security(validate_token, scopes=["auto_assign"])):
    """Webhook endpoint to receive auto-assignment requests from the booking API"""
    try:
        # Check if background agent is enabled
        if not background_agent_enabled:
            logger.info(f"Background agent is disabled. Skipping auto-assignment for booking {webhook_data.booking_id}")
            return WebhookResponse(
                task_id="disabled",
                status="disabled",
                message="Background agent auto-assignment is disabled",
                estimated_completion=""
            )
        
        # Validate event type
        if webhook_data.event_type != "booking.auto_assign_requested":
            raise HTTPException(status_code=400, detail="Invalid event type")
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Calculate estimated completion time (2-5 minutes from now)
        import datetime
        estimated_completion = datetime.datetime.now() + datetime.timedelta(minutes=3)
        
        # Create background task for assignment
        asyncio.create_task(run_background_agent_for_assignment(webhook_data, task_id))
        
        logger.info(f"Auto-assignment task {task_id} queued for booking {webhook_data.booking_id}")
        
        return WebhookResponse(
            task_id=task_id,
            status="queued",
            message=f"Background agent task queued for contact person assignment",
            estimated_completion=estimated_completion.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process webhook")
