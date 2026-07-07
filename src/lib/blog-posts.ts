import blogCuentaComun from "@/assets/blog-cuenta-comun-cover.jpg";
import blogDineroPareja from "@/assets/blog-dinero-pareja-cover.jpg";
import blogGastosInvisibles from "@/assets/blog-gastos-invisibles-cover.jpg";
import blogObjetivosCompartidos from "@/assets/blog-objetivos-compartidos-cover.jpg";
import blogPresupuestoHogar from "@/assets/blog-presupuesto-hogar-cover.jpg";
import blogReunionFinanciera from "@/assets/blog-reunion-financiera-cover.jpg";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  isoDate: string;
  year: string;
  readingTime: string;
  tag: string;
  keywords: string[];
  tone: "green" | "yellow" | "blue";
  cover: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "hablar-de-dinero-en-pareja",
    title: "Cómo hablar de dinero en pareja sin que se convierta en discusión",
    excerpt:
      "Tres rituales sencillos para que la conversación financiera deje de tensar la convivencia y empiece a sumar.",
    date: "12 de junio, 2026",
    isoDate: "2026-06-12",
    year: "2026",
    readingTime: "7 min",
    tag: "Convivencia",
    keywords: ["hablar de dinero en pareja", "finanzas en pareja", "gastos compartidos", "dinero y convivencia"],
    tone: "green",
    cover: blogDineroPareja,
    content: [
      "Hablar de dinero en pareja suele activar una mezcla incómoda de vergüenza, control y miedo. No es casual: la mayoría aprendimos a gestionar las finanzas personales en silencio, sin un marco común para decidir juntos ni una forma clara de repartir gastos compartidos.",
      "El primer paso no es hacer un Excel perfecto, sino acordar un momento fijo. Media hora a la semana basta para mirar ingresos, gastos del hogar, ahorro y deudas con calma. Sin móvil, sin pantalla del trabajo y sin reproches sobre la compra del sábado.",
      "Conviene empezar la conversación por hechos, no por interpretaciones. Cuánto ha entrado, cuánto ha salido, qué pagos quedan pendientes y qué objetivo compartido necesita atención. Cuando la conversación financiera se apoya en datos, baja la sensación de ataque personal.",
      "El segundo paso es separar tres cajas: lo común, lo personal y lo que se ahorra para objetivos compartidos. En lo común entran alquiler, supermercado, recibos, seguros y gastos de convivencia. En lo personal entra lo que cada uno gasta sin rendir cuentas. La tercera caja protege viajes, mudanzas, colchón de emergencia o cualquier plan de futuro.",
      "También ayuda decidir una regla de aportación. Algunas parejas prefieren el 50/50; otras aportan según ingresos para que el esfuerzo sea proporcional. No hay una fórmula única para las finanzas en pareja, pero sí una señal clara: si una persona siente que siempre pierde, el sistema no está funcionando.",
      "El tercero es revisar, no juzgar. Una revisión mensual permite ajustar categorías, detectar gastos invisibles y corregir sin convertir cada error en una discusión. Karma Financiero te da el mapa; la conversación la sostenéis vosotros. Y sí, también vale celebrar cuando el mes cuadra.",
    ],
  },
  {
    slug: "presupuesto-hogar-sin-estres",
    title: "Un presupuesto del hogar que no te robe el domingo",
    excerpt:
      "Olvida las hojas de cálculo infinitas. Así montas un sistema ligero que aguanta los meses raros y los gastos imprevistos.",
    date: "5 de junio, 2026",
    isoDate: "2026-06-05",
    year: "2026",
    readingTime: "8 min",
    tag: "Método",
    keywords: ["presupuesto del hogar", "organizar gastos familiares", "control de gastos", "finanzas domésticas"],
    tone: "yellow",
    cover: blogPresupuestoHogar,
    content: [
      "Un presupuesto del hogar útil no es el que prevé cada céntimo, sino el que sobrevive al primer imprevisto sin que tires todo a la basura. La clave está en pocas categorías, márgenes generosos y una revisión mensual que no robe el domingo.",
      "Empieza con cinco bloques: vivienda, vida diaria, transporte, ocio y ahorro. Esta estructura cubre la mayoría de finanzas domésticas sin convertir el control de gastos en una tarea infinita. Si una categoría necesita demasiadas subcategorías, probablemente estás buscando precisión donde necesitas claridad.",
      "Asigna un porcentaje aproximado a cada bloque y deja un 10% sin etiquetar para lo que siempre aparece: cumpleaños, una avería, un recambio, una cena familiar o un capricho compartido. Ese margen evita que un gasto normal se viva como fracaso.",
      "Para organizar gastos familiares, separa los pagos fijos de los variables. Los fijos son alquiler, hipoteca, seguros o suscripciones. Los variables son supermercado, transporte, ocio, farmacia o regalos. Mirarlos juntos ayuda a entender dónde se puede ajustar sin recortar lo importante.",
      "Registrar movimientos no tiene que ser un trabajo extra. Hazlo en bloques de dos minutos al día o, mejor, en una revisión semanal con tu convivencia. Si tardas más de diez minutos, el sistema es demasiado complejo y acabará abandonado.",
      "El presupuesto también debe tener memoria. Revisa qué categorías se pasan todos los meses y cambia el límite antes de culparte. Un buen método financiero no intenta que el hogar sea perfecto; intenta que sea legible.",
      "Y recuerda: el objetivo no es ahorrar más este mes, sino sostener el método doce meses seguidos. Ahí es donde aparece el verdadero karma financiero: menos ruido, más decisiones compartidas y una economía doméstica que se entiende.",
    ],
  },
  {
    slug: "objetivos-financieros-compartidos",
    title: "Objetivos compartidos: del 'algún día' al primer paso real",
    excerpt:
      "Viajar, mudarse, formar familia, dejar un trabajo. Convierte los grandes deseos en hitos medibles que de verdad ocurren.",
    date: "28 de mayo, 2026",
    isoDate: "2026-05-28",
    year: "2026",
    readingTime: "6 min",
    tag: "Objetivos",
    keywords: ["objetivos financieros", "ahorro en pareja", "metas financieras", "plan financiero familiar"],
    tone: "blue",
    cover: blogObjetivosCompartidos,
    content: [
      "La mayoría de los objetivos financieros compartidos se quedan en conversación de sobremesa porque les falta una cosa: un número y una fecha. Sin eso, son intenciones, no planes. Viajar, mudarse, formar familia o crear un colchón de emergencia necesitan estructura.",
      "Define el objetivo en una frase concreta: 'Ahorrar 6.000 € para mudarnos en septiembre de 2027'. Ahora divide entre los meses que faltan. Ese es tu aporte mensual real, no una estimación romántica.",
      "Cuando hablas de ahorro en pareja, conviene diferenciar entre deseo y compromiso. El deseo es lo que os gustaría que pasara; el compromiso es la cantidad mensual que ambos aceptáis reservar. Si esa cifra aprieta demasiado, el objetivo necesita más tiempo o menos ambición.",
      "Crea una cuenta o categoría separada para ese objetivo. Si vive mezclado con el día a día, desaparece entre supermercado, ocio y recibos. Si tiene su propio espacio, crece a la vista de todos y se convierte en una meta financiera tangible.",
      "Un plan financiero familiar también necesita prioridades. No todos los objetivos pueden avanzar al mismo ritmo. Puede que durante tres meses tenga sentido reforzar el fondo de emergencia y después volver al viaje. Lo importante es que el cambio sea consciente, no improvisado.",
      "Revisa el avance una vez al mes, junto con tu presupuesto. Ver el porcentaje subir mantiene vivo el hábito cuando la motivación inicial se apaga. Y si un mes no se puede aportar, se registra sin drama y se ajusta el calendario.",
    ],
  },
  {
    slug: "cuentas-comunes-sin-perder-independencia",
    title: "Cuentas comunes sin perder independencia",
    excerpt:
      "Cómo decidir qué va a la cuenta compartida, qué se queda en lo personal y qué reglas evitan malentendidos.",
    date: "19 de junio, 2026",
    isoDate: "2026-06-19",
    year: "2026",
    readingTime: "7 min",
    tag: "Pareja",
    keywords: ["cuenta común", "gastos compartidos pareja", "finanzas compartidas", "repartir gastos en pareja"],
    tone: "blue",
    cover: blogCuentaComun,
    content: [
      "Compartir gastos no significa fundir toda la vida financiera en una sola cuenta. De hecho, muchas parejas funcionan mejor cuando combinan una cuenta común clara con espacios personales respetados.",
      "La cuenta común debería cubrir lo que sostiene la convivencia: alquiler o hipoteca, suministros, supermercado, seguros, mascotas, hijos si los hay y cualquier gasto que ambos reconozcan como compartido. Ese límite evita que cada pago tenga que negociarse desde cero.",
      "Lo personal necesita el mismo respeto. Cafés, aficiones, regalos, ropa o planes individuales no deberían convertirse en una auditoría constante. La independencia baja la tensión y hace más sana la conversación sobre finanzas compartidas.",
      "El punto delicado es la proporción. Si los ingresos son parecidos, repartir gastos en pareja al 50% puede funcionar. Si no lo son, suele ser más justo aportar por porcentaje de ingresos. La pregunta útil no es quién paga más, sino si el esfuerzo se siente equilibrado.",
      "También conviene decidir qué pasa con gastos mixtos: una escapada, muebles, regalos familiares o compras grandes. Podéis crear una categoría temporal dentro de la cuenta común para que esos pagos no desordenen el presupuesto del mes.",
      "La regla debe estar escrita y revisarse cuando cambie la realidad. Nuevos ingresos, paro, mudanza, hijos o una deuda pendiente cambian el sistema. Las buenas cuentas comunes no son rígidas: son transparentes.",
    ],
  },
  {
    slug: "gastos-invisibles-del-hogar",
    title: "Los gastos invisibles que desordenan un hogar",
    excerpt:
      "Suscripciones, recambios, pequeños pagos y compras repetidas: el mapa para encontrarlos antes de que pesen.",
    date: "26 de junio, 2026",
    isoDate: "2026-06-26",
    year: "2026",
    readingTime: "6 min",
    tag: "Ahorro",
    keywords: ["gastos invisibles", "ahorro familiar", "control de suscripciones", "reducir gastos del hogar"],
    tone: "yellow",
    cover: blogGastosInvisibles,
    content: [
      "Los gastos invisibles que rompen un presupuesto rara vez llegan con luces de emergencia. Suelen ser pequeños, repetidos y fáciles de justificar: una suscripción que ya no usas, un envío urgente, una compra semanal que nadie registró.",
      "Para encontrarlos, revisa los últimos treinta días y marca todo lo que se repite sin haber sido decidido. No se trata de cancelar por cancelar, sino de recuperar intención sobre el dinero que sale en automático.",
      "El control de suscripciones es uno de los primeros lugares donde aparece ahorro familiar. Plataformas duplicadas, apps que ya no se usan, cuotas anuales olvidadas o servicios contratados por urgencia pueden sumar mucho más de lo que parece.",
      "Después mira los recambios y compras pequeñas: pilas, farmacia, menaje, envíos, cafés, snacks, comisiones y pagos de última hora. No son enemigos del presupuesto, pero necesitan un lugar. Si no tienen categoría, siempre parecen excepciones.",
      "Para reducir gastos del hogar sin recortar bienestar, elige una acción por semana. Cancelar una suscripción, agrupar compras, planificar una comida más en casa o revisar tarifas. Los cambios pequeños sostenidos funcionan mejor que una austeridad intensa que dura diez días.",
      "Cuando esos gastos se vuelven visibles, la sensación cambia. No porque el hogar deje de gastar, sino porque vuelve a elegir. Y elegir con calma es una forma muy concreta de ahorrar.",
    ],
  },
  {
    slug: "reunion-financiera-de-quince-minutos",
    title: "La reunión financiera de quince minutos",
    excerpt:
      "Un guion simple para revisar cuentas compartidas sin convertirlo en una tarde de tensión.",
    date: "1 de julio, 2026",
    isoDate: "2026-07-01",
    year: "2026",
    readingTime: "5 min",
    tag: "Rituales",
    keywords: ["reunión financiera", "revisión de gastos", "finanzas del hogar", "organización financiera"],
    tone: "green",
    cover: blogReunionFinanciera,
    content: [
      "Una reunión financiera no necesita una mesa enorme ni dos horas de energía perfecta. Quince minutos bien usados pueden evitar muchas conversaciones difíciles acumuladas y mejorar la organización financiera del hogar.",
      "Empieza por los hechos: ingresos recibidos, gastos importantes, pagos pendientes y saldo de objetivos. Durante los primeros cinco minutos nadie interpreta ni culpa, solo se mira el mapa.",
      "Los siguientes cinco minutos son para decidir: qué pago falta, qué categoría se está pasando y qué ajuste pequeño ayuda al mes. Una sola decisión clara vale más que diez ideas vagas.",
      "Reserva los últimos minutos para la revisión de gastos compartidos. ¿Hay algo que se repite? ¿Alguna compra que debería ir a una categoría común? ¿Un objetivo que necesita más o menos aportación? Estas preguntas convierten el dinero en una tarea manejable.",
      "Si vivís en pareja o compartís casa, dejad por escrito el acuerdo de la semana. Puede ser una nota simple: 'bajamos ocio 40 €, revisamos suscripciones y aportamos 100 € al colchón'. Lo importante es que la decisión no dependa de la memoria.",
      "Cierra con algo que haya salido bien. Puede sonar menor, pero terminar reconociendo avance cambia el tono de la próxima reunión. El dinero compartido también necesita memoria amable.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
