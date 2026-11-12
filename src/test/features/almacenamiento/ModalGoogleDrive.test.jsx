import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ModalGoogleDrive from "../../../features/almacenamiento/components/modals/ModalGoogleDrive";

describe("ModalGoogleDrive", () => {
  it("no renderiza nada cuando abierto es false", () => {
    render(<ModalGoogleDrive abierto={false} alCerrar={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza el diálogo accesible con título y botón de acción cuando abierto es true", () => {
    render(<ModalGoogleDrive abierto={true} alCerrar={() => {}} />);

    const dialogo = screen.getByRole("dialog", { name: "Google Drive" });
    expect(dialogo).toBeInTheDocument();
    expect(dialogo).toHaveAttribute("aria-modal", "true");

    const botonIr = screen.getByRole("link", { name: /Ir a Google Drive/i });
    expect(botonIr).toBeInTheDocument();
    expect(botonIr).toHaveAttribute("href", "https://drive.google.com");
    expect(botonIr).toHaveAttribute("target", "_blank");
    expect(botonIr).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("muestra los datos de la cuenta vinculada cuando se provee la prop cuenta", () => {
    const cuenta = {
      id: "cuenta-1",
      proveedor: "GOOGLE_DRIVE",
      etiquetaCuenta: "usuario@ejemplo.test",
      estado: "ACTIVA",
    };

    render(<ModalGoogleDrive abierto={true} alCerrar={() => {}} cuenta={cuenta} />);

    expect(screen.getByText("Cuenta vinculada")).toBeInTheDocument();
    expect(screen.getByText("usuario@ejemplo.test")).toBeInTheDocument();
    expect(screen.getByText("Conectada")).toBeInTheDocument();

    const botonIr = screen.getByRole("link", { name: /Ir a Google Drive/i });
    expect(botonIr).toHaveAttribute(
      "href",
      "https://drive.google.com/drive/u/usuario%40ejemplo.test"
    );
  });

  it("llama a alCerrar al hacer clic en el botón de cerrar («X»)", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    render(<ModalGoogleDrive abierto={true} alCerrar={alCerrar} />);

    const botonX = screen.getByRole("button", { name: "Cerrar ventana de Google Drive" });
    await usuario.click(botonX);

    expect(alCerrar).toHaveBeenCalledOnce();
  });

  it("llama a alCerrar al hacer clic en el botón Cerrar secundario", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    render(<ModalGoogleDrive abierto={true} alCerrar={alCerrar} />);

    const botonCerrar = screen.getByRole("button", { name: "Cerrar" });
    await usuario.click(botonCerrar);

    expect(alCerrar).toHaveBeenCalledOnce();
  });

  it("llama a alCerrar al hacer clic en el enlace Ir a Google Drive", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    render(<ModalGoogleDrive abierto={true} alCerrar={alCerrar} />);

    const botonIr = screen.getByRole("link", { name: /Ir a Google Drive/i });
    await usuario.click(botonIr);

    expect(alCerrar).toHaveBeenCalledOnce();
  });
});
