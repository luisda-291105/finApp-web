import { describe, expect, it } from "vitest";
import { referenciaGmailMovimiento } from "../../../features/contabilidad/utils/contabilidadHelpers";

describe("referenciaGmailMovimiento", () => {
  it("extrae la cuenta y el mensaje del origen Gmail", () => {
    expect(
      referenciaGmailMovimiento({
        origenTipo: "GMAIL",
        origenId: "cuenta-1:mensaje-1",
      }),
    ).toEqual({ cuentaId: "cuenta-1", mensajeId: "mensaje-1" });
  });

  it("ignora movimientos que no vienen de Gmail", () => {
    expect(
      referenciaGmailMovimiento({
        origenTipo: "EFECTIVO",
        origenId: "cuenta-1:mensaje-1",
      }),
    ).toBeNull();
    expect(referenciaGmailMovimiento({ origenId: "cuenta-1:mensaje-1" })).toBeNull();
  });

  it("ignora orígenes Gmail sin cuenta o sin mensaje", () => {
    expect(referenciaGmailMovimiento({ origenTipo: "GMAIL", origenId: "mensaje-1" })).toBeNull();
    expect(referenciaGmailMovimiento({ origenTipo: "GMAIL", origenId: ":mensaje-1" })).toBeNull();
    expect(referenciaGmailMovimiento({ origenTipo: "GMAIL", origenId: "cuenta-1:" })).toBeNull();
  });
});
