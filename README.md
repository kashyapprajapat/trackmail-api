# TrackMail-API 📨📧

#### Build and deploy an email open tracking API inspired by Mailchimp. Uses a Dead-pixel-based method to monitor email engagement in real time.

---

## 📩 Dead Pixel Technique for Email Open Tracking

The **Dead Pixel Technique** is a popular method to track when a user opens an email. It involves embedding a tiny, invisible image (typically 1x1 pixel) into the body of the email. When the recipient opens the email, their email client loads the image from your server — and this request can be logged as an "open" event.

### 🔍 How It Works

1. A transparent 1x1 image (tracking pixel) is embedded in the email.
2. The image's `src` points to your server (e.g., `https://yourdomain.com/track?id=123`).
3. When the email is opened, the image is loaded, and your server records the access (timestamp, IP, user agent, etc.).

---
### It's Fow
![process1](./EmailopenSystem.png)

## Detailed part
![process2](./Email2.png)


---
### 🧪 Example

Here’s an example of HTML code you’d embed in the email:

```html
<img src="https://yourdomain.com/track?id=user123" width="1" height="1" style="display:none;" alt="" />
```

---
# Docker CI/Cd PipeLine Flow
image Link -> https://hub.docker.com/repository/docker/kashyap14112003/trackmail-api/general


![cicd](./Screenshot%202025-07-07%20185622.png)





---

### It is just POC ☕👨🏻‍💻
##### /health route design by llm
![Health](./healthroute.png)

