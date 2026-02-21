export function validateChatPayload(body: unknown) {
  if (!body) return { valid: false, error: "Empty request body" };
  if (typeof body !== "object" || body === null) return { valid: false, error: "Invalid payload" };
  const msg = (body as { message?: unknown }).message;
  if (typeof msg !== "string") {
    return { valid: false, error: "`message` is required and must be a string" };
  }
  if (msg.trim().length === 0) {
    return { valid: false, error: "`message` must not be empty" };
  }
  return { valid: true };
}

export default validateChatPayload;
