export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function createHttpClient() {
  let csrf = "";
  async function request<T>(
    path: string,
    method = "GET",
    data?: unknown,
  ): Promise<T> {
    const response = await fetch("/api/" + path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    if (response.status === 204) return undefined as T;
    const body: unknown = await response
      .json()
      .catch(() => ({
        detail: "Não foi possível ler a resposta do servidor.",
      }));
    if (!response.ok) {
      const details =
        body && typeof body === "object"
          ? (body as Record<string, unknown>)
          : {};
      const message =
        typeof details.detail === "string"
          ? details.detail
          : Object.entries(details)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(" ") : String(value)}`,
              )
              .join(" • ");
      throw new ApiError(
        message || "Não foi possível concluir a solicitação.",
        response.status,
      );
    }
    return body as T;
  }
  return {
    request,
    setCsrf: (token: string) => {
      csrf = token;
    },
  };
}
export type HttpClient = ReturnType<typeof createHttpClient>;
