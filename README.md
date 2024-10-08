## Web-Shot:  A Blazing Fast Screenshot Service

<p align="center">
    <img src="assets/images/logo.png">
</p>

Web-Shot is a high-performance online screenshot service that lets you capture any webpage with ease. 

### Features

* **Lightning Speed:** Capture webpages in a flash thanks to the power of Google Chrome.
* **Flexible API:** Integrate Web-Shot seamlessly into your applications with a well-documented API.  For detailed API specifications, refer to the [OpenAPI 3.0 document](openapi.yaml)
* **Simple UI:** For those who prefer a point-and-click approach, Web-Shot offers a user-friendly interface. 
* **Tech Stack:** Built with modern technologies like Nuxt.js, Prisma, and TypeScript for a robust and maintainable codebase.
* **Deployment Options:** Deploy Web-Shot on your server or leverage the convenience of Docker images.
* **Open Source & MIT Licensed:** Contribute to the project and use it in your own projects freely under the permissive MIT license.

### Requirements

* Node.js >= 20
* MySQL >= 5.7 or MariaDB >= 10

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/dnj/web-shot
```

**2. Install dependencies:**

```bash
cd web-shot
npm install
```

**3. Configure database connection:**

Rename `.env.example` to `.env` and configure your database connection details.
Then you can build Prisma Client:

```bash
npx prisma generate
```

And create tables:

```bash
npx prisma db push
```

**4. Run the application:**

```bash
npm run dev
```

This will start the development server. Access the UI at `http://localhost:3000` by default.

### Usage

**API:**

Web-Shot offers a simple API for programmatic screenshot capture. The only endpoint currently available is:

* `/capture` (GET): This endpoint captures a screenshot of a specified webpage.

Response Format:
The response will be the captured screenshot in either JPEG or PNG format depending on the request parameters.

**Query Parameters:**

| Name        | Type    | Required | Default Value | Description                                                 |
|-------------|---------|----------|----------------|-------------------------------------------------------------|
| url         | string  | Yes      | -             | The URL of the webpage you want to capture.                 |
| width        | number  | No       | 1200           | The desired width of the final screenshot in pixels.       |
| height       | number  | No       | 600            | The desired height of the final screenshot in pixels.      |
| maxAge       | number  | No       | 86400          | Max age in seconds of image if it already cached. Min 10s. |
| format       | string  | No       | "jpeg"         | Image format, possible values: "jpeg" or "png".            |
| fullpage     | boolean | No       | false          | Whether to take a screenshot of the full webpage or not.   |
| viewportWidth | number  | No       | 1200           | The page width in pixel. Min 320, Max 4096.                 |
| viewportHeight| number  | No       | 600            | The page height in pixel. Min 320, Max 4096.                |
| timeout     | number  | No       | 10000          | The max time in ms to wait for the page to load. Min 2000, Max 15000. |


**UI:**

Visit `http://localhost:3000` to access the user interface for capturing screenshots.

### Docker Deployment

Web-Shot provides a convenient Docker image for streamlined deployment. This section guides you through getting started with Web-Shot using Docker.

```bash
docker pull ghcr.io/dnj/web-shot:2
```

**Environment Variables:**

Web-Shot utilizes environment variables for configuration. You can either specify them directly when running the container.

Here are some of the important environment variables:

* `DATABASE_URL`: URL for your database connection (refer to Prisma documentation for format).
* `PORT`: Port on which the Web-Shot application will listen (defaults to 80).

For a more detailed configuration using a `.env` file and Docker Compose, refer to the `docker-compose.yaml` file provided in the repository.

### License

Web-Shot is licensed under the MIT License. See the `LICENSE` file for details.
