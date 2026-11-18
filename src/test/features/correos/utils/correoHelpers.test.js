import { describe, expect, it } from "vitest";
import { agruparFuentesPorCuenta } from "../../../../features/correos/utils/correoHelpers";

const CUENTAS = [
  { id: "cuenta-a", email: "a@ejemplo.test" },
  { id: "cuenta-b", email: "b@ejemplo.test" },
  { id: "cuenta-c", email: "c@ejemplo.test" },
];

const FUENTE_A = { idFuente: "fuente-a", contenido: "a@ejemplo.test" };
const FUENTE_B = { idFuente: "fuente-b", contenido: "b@ejemplo.test" };
const FUENTE_C = { idFuente: "fuente-c", contenido: "C@Ejemplo.test" };
const FUENTE_HUERFANA = { idFuente: "fuente-x", contenido: "x@otro.test" };

describe("agruparFuentesPorCuenta", () => {
  it("asigna cada fuente a la cuenta dueña de su dirección sin repetirla", () => {
    const grupos = agruparFuentesPorCuenta(
      [FUENTE_A, FUENTE_B, FUENTE_C],
      CUENTAS,
      "cuenta-a",
    );

    expect(grupos).toEqual([
      { cuentaId: "cuenta-a", fuentes: [FUENTE_A] },
      { cuentaId: "cuenta-b", fuentes: [FUENTE_B] },
      { cuentaId: "cuenta-c", fuentes: [FUENTE_C] },
    ]);
  });

  it("incluye las cuentas sin fuentes para consultar también su bandeja", () => {
    const grupos = agruparFuentesPorCuenta([FUENTE_A], CUENTAS, "cuenta-a");

    expect(grupos.map((grupo) => grupo.cuentaId)).toEqual([
      "cuenta-a",
      "cuenta-b",
      "cuenta-c",
    ]);
    expect(grupos[1].fuentes).toEqual([]);
    expect(grupos[2].fuentes).toEqual([]);
  });

  it("manda las fuentes sin cuenta asignada a la cuenta seleccionada", () => {
    const grupos = agruparFuentesPorCuenta(
      [FUENTE_HUERFANA],
      CUENTAS,
      "cuenta-b",
    );

    expect(grupos[1]).toEqual({
      cuentaId: "cuenta-b",
      fuentes: [FUENTE_HUERFANA],
    });
    expect(grupos[0].fuentes).toEqual([]);
  });

  it("prefiere cuentaGmailId y cae a la dirección si la cuenta ya no existe", () => {
    const tarjeta = {
      idFuente: "gmail-cuenta-c",
      contenido: "c@ejemplo.test",
      cuentaGmailId: "cuenta-c",
    };
    const tarjetaObsoleta = {
      idFuente: "gmail-vieja",
      contenido: "a@ejemplo.test",
      cuentaGmailId: "cuenta-eliminada",
    };

    const grupos = agruparFuentesPorCuenta(
      [tarjeta, tarjetaObsoleta],
      CUENTAS,
      null,
    );

    expect(grupos[0]).toEqual({
      cuentaId: "cuenta-a",
      fuentes: [tarjetaObsoleta],
    });
    expect(grupos[2]).toEqual({ cuentaId: "cuenta-c", fuentes: [tarjeta] });
  });

  it("usa la primera cuenta como respaldo si la seleccionada no existe", () => {
    const grupos = agruparFuentesPorCuenta(
      [FUENTE_HUERFANA],
      CUENTAS,
      "cuenta-inexistente",
    );

    expect(grupos[0].fuentes).toEqual([FUENTE_HUERFANA]);
  });

  it("no devuelve grupos sin cuentas Gmail", () => {
    expect(agruparFuentesPorCuenta([FUENTE_A], [], "cuenta-a")).toEqual([]);
    expect(agruparFuentesPorCuenta(null, null, null)).toEqual([]);
  });
});
