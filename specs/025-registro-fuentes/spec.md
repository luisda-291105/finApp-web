# Especificación: Modal de registro de fuentes

## Objetivo
modificar el modal de registro de fuentes  el cual tendra registro de correos , registro de telefono  y otros

## datos que recibe
@Id
    @Column(length = 36, nullable = false)
    private String idFuente;

    @Column(length = 36, nullable = false)
    private String tipo;

    @Column(length = 255, nullable = false)
    private String contenido;

    @Column(nullable = false)
    private boolean estado;

    @Column(nullable = false)
    private LocalDate fechaCreacion;

la fecha lo sacas con el formato YYY-MM-DD


## diseño esperado
un modal con input para contenido , select para los tipos  , por defecto vendran activos , la fecha se saca localmente igual con el id