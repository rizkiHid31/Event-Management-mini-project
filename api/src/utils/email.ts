import { resend } from "../lib/resend.js";
import Handlebars from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";

interface SendMail {
  from: string;
  to: string;
  subject: string;
  template?: string;
  emailData: Record<string, any>;
}

export async function sendEmail({
  from,
  to,
  subject,
  template = "welcome",
  emailData,
}: SendMail) {
  try {
    const filePath = path.join(
      process.cwd(),
      `src/templates/emails/${template}.template.hbs`,
    );
    const source = await fs.readFile(filePath, "utf-8");
    const compiledTemplate = Handlebars.compile(source);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: compiledTemplate(emailData),
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Email send error:", err);
    // Don't throw — email should not block business logic
  }
}
