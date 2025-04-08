
## Installation



### Backend Setup

1. Navigate to the `server` directory:

    ```sh
    cd server
    ```

2. Create a virtual environment and activate it:

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required Python packages:

    ```sh
    pip install -r requirements.txt
    ```

4. Set up the PostgreSQL database:

    ```sh
    psql -U postgres -c "CREATE DATABASE mydatabase;"
    ```

5. Configure environment variables in the `.env` file:

    ```env
    OPENAI_API_KEY=your_openai_api_key
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=mydatabase
    DB_USER=postgres
    DB_PASSWORD=your_db_password
    SECRET_KEY=your_secret_key
    ```

6. Initialize the database:

    ```sh
    python database/db_init.py
    ```

7. Run the Flask server:

    ```sh
    flask run
    ```

### Frontend Setup

1. Navigate to the `helix-ui` directory:

    ```sh
    cd helix-ui
    ```

2. Install the required Node.js packages:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm run dev
    ```

## Usage

- Access the frontend at `http://localhost:5173`.
- Interact with the Helix Agent via the chat interface.
- Manage tasks and sequences in the workspace.

## API Endpoints



### Messages

- `POST /api/message`: Process user message

### Tasks

- `POST /api/execute-task`: Execute a task

## WebSocket Events

- `user_message`: Send a message to the Helix Agent
- `ai_response`: Receive a response from the Helix Agent
- `workspace_update`: Receive workspace updates

