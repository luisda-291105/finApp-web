import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerCorreosGmail } from "../../../../services/gmailServicio";
import { consultarCorreosDeFuente, consultarCorreosDeFuentes } from "../../../../features/correos/services/correosService";

vi.mock("../../../../services/gmailServicio", () => ({ obtenerCorreosGmail: vi.fn() }));

const FUENTE_A = { idFuente: "a", contenido: "a@ejemplo.test" };
const FUENTE_B = { idFuente: "b", contenido: "b@ejemplo.test" };
const MENSAJES = [
  { id: "1", destinatario: "A <a@ejemplo.test>, copia@ejemplo.test" },
  { id: "2", destinatario: "b@ejemplo.test" },
  { id: "3", destinatario: "destinatario@ejemplo.test" },
];

beforeEach(() => {
  vi.clearAllMocks();
  obtenerCorreosGmail.mockResolvedValue(MENSAJES);
});

describe("correosService", () => {
  it("mantiene solo los mensajes recibidos por la dirección de la fuente", async () => {
    await expect(consultarCorreosDeFuente("cuenta", FUENTE_A)).resolves.toEqual([MENSAJES[0]]);
    expect(obtenerCorreosGmail).toHaveBeenCalledWith("cuenta", [FUENTE_A]);
  });

  it("consulta una vez y reparte los mensajes entre todas las fuentes", async () => {
    await expect(consultarCorreosDeFuentes("cuenta", [FUENTE_A, FUENTE_B])).resolves.toEqual([
      ["a", [MENSAJES[0]]], ["b", [MENSAJES[1]]],
    ]);
    expect(obtenerCorreosGmail).toHaveBeenCalledTimes(1);
    expect(obtenerCorreosGmail).toHaveBeenCalledWith("cuenta", [FUENTE_A, FUENTE_B]);
  });
});
