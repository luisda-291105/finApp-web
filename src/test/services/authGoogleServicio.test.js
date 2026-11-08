import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ obtener: vi.fn(), requestCode: vi.fn(), initCodeClient: vi.fn() }));

vi.mock("../../services/httpServicio", () => ({ obtener: mocks.obtener }));

import { getEndpoint } from "../../config/api.config";
import { iniciarLoginGoogle } from "../../features/auth/services/authGoogleServicio";

describe("authGoogleServicio", () => {
  beforeEach(() => {
    mocks.obtener.mockReset().mockResolvedValue({ datos: { state: "state-de-prueba" } });
    mocks.requestCode.mockReset();
    mocks.initCodeClient.mockReset().mockReturnValue({ requestCode: mocks.requestCode });
    window.google = { accounts: { oauth2: { initCodeClient: mocks.initCodeClient } } };
  });

  afterEach(() => {
    delete window.google;
    vi.unstubAllEnvs();
  });

  it("prepara state ligado a sesión y solicita autorización en modo redirect", async () => {
    await iniciarLoginGoogle();

    expect(mocks.obtener).toHaveBeenCalledWith(getEndpoint("googleAuth.state"));
    expect(mocks.initCodeClient).toHaveBeenCalledWith(expect.objectContaining({
      ux_mode: "redirect",
      redirect_uri: getEndpoint("googleAuth.callback"),
      scope: "openid email profile",
      state: "state-de-prueba",
      select_account: true,
    }));
    expect(mocks.requestCode).toHaveBeenCalledOnce();
  });

  it("no inicia el redirect si el backend no entrega state", async () => {
    mocks.obtener.mockResolvedValue({ datos: null });
    await expect(iniciarLoginGoogle()).rejects.toThrow("No se pudo preparar la verificación segura de Google.");
    expect(mocks.initCodeClient).not.toHaveBeenCalled();
  });
});
