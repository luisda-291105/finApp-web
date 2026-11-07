/**
 * @uso        Estado y acciones para consultar y mantener tarjetas
 * @funciones  useTarjetas()
 * @datos      Carga tarjetas del usuario y aplica cambios CRUD al listado
 * @eventos    Carga al cambiar usuario, actualización y eliminación
 * @estados    tarjetas, cargando, error
 * @usadoPor   TarjetasPage
 */
import { useCallback, useEffect, useState } from "react";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { actualizarTarjeta, eliminarTarjeta, obtenerTarjetasPorUsuario } from "../services/tarjetasService";

function mostrarVencimiento(vencimiento) {
  const fecha = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(vencimiento || "");
  return fecha ? `${fecha[2]}/${fecha[1].slice(-2)}` : vencimiento || "";
}

/** Expone datos y acciones CRUD sin trasladar la lógica al componente de página. */
export function useTarjetas() {
  const { usuario } = useUsuarioActivo();
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarTarjetas = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setTarjetas([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerTarjetasPorUsuario(usuario.idUsuario);
      const datos = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setTarjetas((Array.isArray(datos) ? datos : []).map((tarjeta) => ({ ...tarjeta, expiracion: mostrarVencimiento(tarjeta.expiracion) })));
    } catch (fallo) {
      setTarjetas([]);
      setError(fallo?.message || "No se pudieron cargar tus tarjetas.");
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarTarjetas(); }, [cargarTarjetas]);

  const guardarTarjeta = useCallback(async (idTarjeta, cambios) => {
    const actualizada = await actualizarTarjeta(idTarjeta, cambios);
    const tarjetaLista = { ...actualizada, expiracion: mostrarVencimiento(actualizada.expiracion) };
    setTarjetas((actuales) => actuales.map((tarjeta) => tarjeta.idTarjeta === idTarjeta ? tarjetaLista : tarjeta));
    return tarjetaLista;
  }, []);

  const borrarTarjeta = useCallback(async (idTarjeta) => {
    await eliminarTarjeta(idTarjeta);
    setTarjetas((actuales) => actuales.filter((tarjeta) => tarjeta.idTarjeta !== idTarjeta));
  }, []);

  return { usuario, tarjetas, cargando, error, cargarTarjetas, guardarTarjeta, borrarTarjeta };
}
