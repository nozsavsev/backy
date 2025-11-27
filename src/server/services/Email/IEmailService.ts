export const I_EMAIL_SERVICE_TOKEN = Symbol.for("IEmailService");

export interface IEmailService {
  sendEmail(email: string, subject: string, body: string): Promise<void>;
}
