import { describe, expect, it } from "vitest";
import { crearId, esCarpeta, esArchivo, extensionDe, iconoArchivo, formatearBytes, esRecienteArchivo } from "../../../../features/almacenamiento/utils/archivos";

describe("utils/archivos", () => {
  it("detecta si un item es carpeta o archivo", () => {
    expect(esCarpeta({ tipo: "carpeta" })).toBe(true);
    expect(esArchivo({ tipo: "archivo" })).toBe(true);
    expect(esCarpeta({ tipo: "archivo" })).toBe(false);
    expect(esArchivo({ tipo: "carpeta" })).toBe(false);
  });

  it("extrae la extensión en minúsculas sin punto", () => {
    expect(extensionDe("Factura.PDF")).toBe("pdf");
    expect(extensionDe("foto.jpg")).toBe("jpg");
    expect(extensionDe("nombre-sin-extensione")).toBe("");
  });

  it("mapea extensiones a claves de icono por tipo de archivo", () => {
    expect(iconoArchivo("factura.pdf")).toBe("pdf");
    expect(iconoArchivo("foto.PNG")).toBe("imagen");
    expect(iconoArchivo("presupuesto.xlsx")).toBe("hoja");
    expect(iconoArchivo("documento.docx")).toBe("documento");
    expect(iconoArchivo("presentacion.pptx")).toBe("presentacion");
    expect(iconoArchivo("copia.zip")).toBe("archivo");
  });

  it("formatea tamaños a una etiqueta corta", () => {
    expect(formatearBytes(0)).toBe("0 B");
    expect(formatearBytes(2048)).toBe("2 KB");
    expect(formatearBytes(5 * 1024 * 1024)).toBe("5 MB");
  });

  it("detecta si un archivo está dentro de los últimos días", () => {
    expect(esRecienteArchivo(new Date(Date.now() - 1000).toISOString())).toBe(true);
    expect(esRecienteArchivo(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString())).toBe(false);
    expect(esRecienteArchivo("fecha-invalida")).toBe(false);
  });

  it("genera identificadores únicos", () => {
    expect(crearId()).not.toBe(crearId());
  });
});
