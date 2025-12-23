// test-email.js (in project root)
import { sendVerificationEmail } from "./src/server/services/email.js";

sendVerificationEmail("btabdulah@gmail.com", "test-token-123")
  .then(result => console.log("Email sent:", result))
  .catch(err => console.error("Email failed:", err));