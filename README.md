# Quran Web App

A modern Quran reader with Arabic text, English translation, Urdu translation, and Roman Urdu translation.

## Demo

🌐 [Open the live Quran Web App](https://yourwebsite.com/)

## Features

- Read the complete Quran
- Arabic Quran text
- English translation
- Urdu translation
- Roman Urdu translation
- Search surahs and verses
- Navigate by Quran page and Juz
- Quranic duas section
- Adjustable reading settings
- Responsive design for desktop and mobile
- Static deployment with Cloudflare Pages

## Technologies

- Next.js
- React
- TypeScript
- CSS
- Cloudflare Pages

## Run locally

Clone the repository:

```bash
git clone https://github.com/yourusername/your-repository.git
cd your-repository
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

The static production files are generated in the `out` directory.

## Deploy with Cloudflare Pages

This project is configured for a static Next.js export. The `output: "export"` setting in `next.config.ts` generates the `out` directory during the build. The `out` directory is ignored by Git and does not need to be committed.

No environment variables or API keys are required.

### 1. Open Cloudflare Pages

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your Cloudflare account.
3. Open **Workers & Pages**.
4. Click **Create application**.
5. Select **Pages**.
6. Choose **Import an existing Git repository**.

### 2. Connect GitHub

1. Click **Connect to Git**.
2. Choose **GitHub**.
3. Authorize Cloudflare to access your repositories.
4. Select your fork or repository.
5. Click **Begin setup**.

### 3. Configure the build

Use the following settings:

| Setting | Value |
|---|---|
| Project name | `quran-reader` or another available name |
| Production branch | `main` |
| Framework preset | `Next.js (Static HTML Export)` |
| Root directory | `/` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variables | None |

Do not add an environment variable. Cloudflare Pages provides a compatible Node.js build environment by default.

### 4. Deploy

Click **Save and Deploy**. Cloudflare Pages will install the dependencies, run `npm run build`, and publish the generated `out` directory.

After the deployment succeeds, Cloudflare will provide a temporary URL similar to:

```text
https://your-project.pages.dev
```

Open that URL and test the Quran text, translations, search, settings, and duas.

### 5. Add the custom domain

Inside the Pages project:

1. Open **Custom domains**.
2. Click **Set up a domain**.
3. Enter `yourwebsite.com`.
4. Click **Continue**.

Add the domain in the Pages dashboard before creating the DNS record. This allows Cloudflare to validate and route the custom hostname correctly.

### 6. Configure DNS

If `yourwebsite.com` is already managed by Cloudflare, Cloudflare may create the DNS record automatically.

For a subdomain such as `app.yourwebsite.com`, if DNS is managed by another provider, create this record using the exact Pages target shown in the Cloudflare dashboard:

| Type | Name | Target |
|---|---|---|
| CNAME | `app` | `<your-project>.pages.dev` |

Remove any conflicting `A`, `AAAA`, or `CNAME` record for the hostname you are connecting.

### 7. Confirm HTTPS

Wait for the custom domain status to become **Active**, then open:

```text
https://yourwebsite.com
```

Cloudflare Pages provisions HTTPS for the custom domain automatically.

### 8. Future deployments

Every push to the `main` branch automatically starts a new production deployment:

```text
GitHub push → Cloudflare build → production deployment
```

Pull requests can also receive preview deployments through Cloudflare Pages.

### Common issues

- **`out` directory not found:** confirm that the framework preset is `Next.js (Static HTML Export)` and the output directory is `out`.
- **Build fails because of Node.js:** check that the Pages project is using the current build system. A `NODE_VERSION` variable is normally unnecessary for new projects.
- **Custom domain shows `522`:** make sure the hostname was added under Pages **Custom domains** before adding the CNAME record, and remove conflicting DNS records.
- **Old content appears:** check for Cloudflare cache rules or purge the cache after deployment.

## Repository

[GitHub Repository](https://github.com/yourusername/your-repository)

## License

This project is provided as an open-source Quran reading application. Please verify and respect the licensing and attribution requirements of any included translation content before redistributing it.
