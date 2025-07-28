# Securing AI Agents with Asgardeo

This project demonstrates how to secure AI agents using [Asgardeo](https://wso2.com/asgardeo/). We use a hotel booking system as a practical use case to showcase how to implement robust security measures for your AI agents, ensuring that they operate within a secure and controlled environment.

## The Challenge: Securing AI Agents

As AI agents become more prevalent, securing them becomes a critical concern. How do you ensure that only authorized users can interact with your AI agents? How do you control what actions an AI agent can perform on behalf of a user? How do you prevent malicious actors from exploiting your AI agents to gain unauthorized access to your systems?

This project provides a comprehensive solution to these challenges, demonstrating how to:

*   **Manage Agent Identities:** Securely manage the identities of your AI agents, ensuring that they can be trusted and verified.
*   **Authenticate and Authorize Users:** Secure your AI agents by ensuring that only authenticated and authorized users can interact with them.
*   **Implement Fine-Grained Access Control:** Use OAuth 2.0 scopes to define and enforce fine-grained permissions for your AI agents, controlling what actions they can perform.
*   **Secure Communication:** Protect the communication between your frontend, backend, and AI agents using industry-standard protocols.

## The Gardeo Hotel: A Secure AI Use Case

To illustrate these security concepts, we've built the Gardeo Hotel, a modern, AI-powered hotel booking website. The Gardeo Hotel website allows users to book rooms and view their reservations. It also features an AI assistant that can be used to book rooms using natural language.

This is not just a simple chatbot. The AI assistant is a powerful tool that can access and modify sensitive user data. Therefore, it is crucial to ensure that it is secure.

## Architecture

The system is composed of three main services:

*   **Frontend:** A React application that provides the user interface for searching, booking, and managing hotel reservations.
*   **Backend:** A FastAPI application that serves as the main API for handling hotel data, bookings.
*   **AI Agents Service:** A Python service that provides the natural language processing and booking logic for the AI 
assistant.

These services are designed to run in Docker containers, and a `docker-compose.yml` file is provided for easy setup and orchestration.

## Getting Started

To get started with this project, you can use either Docker or a native setup. For detailed instructions, please refer to the [SETUP.md](SETUP.md) file.

### Prerequisites

*   Docker and Docker Compose (for Docker setup)
*   Python 3.11+, Node.js 16+, and other dependencies listed in `SETUP.md` (for native setup)

### Quick Start (with Docker)

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/hotel-booking-system.git
    cd hotel-booking-system
    ```

2.  Start the services using Docker Compose:
    ```bash
    docker-compose up -d
    ```

3.  The application will be available at `http://localhost:3000`.

## API Documentation

The backend and AI agent services provide OpenAPI documentation for their respective APIs.

*   **Backend API:** [http://localhost:8001/docs](http://localhost:8001/docs)
*   **AI Agents API:** [http://localhost:8000/docs](http://localhost:8000/docs)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
