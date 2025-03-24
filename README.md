# Realtime Code Editor

A collaborative real-time code editor with language execution support.

## Prerequisites

Ensure you have the following installed on your system:

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [gcc/g++ (for C++ compilation)](https://gcc.gnu.org/)
-   [Python (for Python execution)](https://www.python.org/)
-   [Java JDK (for Java execution)](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)

## Installation

### 1. Clone the repository

```sh
git clone https://github.com/An12iket/codeSync.git
cd codeSync

```

### Install dependencies

```sh
npm install
```

## Environment Variables Setup


### Frontend (.env)

Create a `.env` file at the root folder and add the following:

```
REACT_APP_BACKEND_URL=http://localhost:5000

```

## Running the Project

### Start the Backend (Server)

```sh
node server.js
```

This will run the backend on `http://localhost:5000`.

### Start the Frontend (Client)

```sh
npm run start:front

```

This will run the frontend on `http://localhost:3001`.

## Usage

1.  Open `http://localhost:3001` in your browser.
2.  Enter a room ID and username to join or create a new room.
3.  Write and execute code in real time.

## Troubleshooting

-   If port 3001 or 5000 is already in use, stop the process using the port:
    
    ```sh
    npx kill-port 3001 5000
    
    ```
    
-   If CORS issues arise, ensure the backend allows requests from `http://localhost:3001`.
-   If execution errors occur, verify that the required compilers are installed.

## License

This project is licensed under the MIT License.
