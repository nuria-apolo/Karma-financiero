import blogPareja from "@/assets/blog-pareja.jpg";
import blogPresupuesto from "@/assets/blog-presupuesto.jpg";
import blogObjetivos from "@/assets/blog-objetivos.jpg";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  year: string;
  readingTime: string;
  tag: string;
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
    year: "2026",
    readingTime: "5 min",
    tag: "Convivencia",
    tone: "green",
    cover: blogPareja,
    content: [
      "Hablar de dinero en pareja suele activar una mezcla incómoda de vergüenza, control y miedo. No es casual: la mayoría aprendimos a gestionarlo en silencio, sin un marco común para decidir juntos.",
      "El primer paso no es hacer un Excel perfecto, sino acordar un momento fijo —media hora a la semana basta— para mirar los números con calma. Sin móvil, sin pantalla del trabajo, sin reproches sobre la compra del sábado.",
      "El segundo es separar tres cajas: lo común (alquiler, supermercado, recibos), lo personal (lo que cada uno gasta sin rendir cuentas) y lo que se ahorra para objetivos compartidos. Cuando cada euro tiene su sitio, dejan de pelearse.",
      "El tercero es revisar, no juzgar. Karma Financiero te da el mapa; la conversación la sostenéis vosotros. Y sí, también vale celebrar cuando el mes cuadra.",
    ],
  },
  {
    slug: "presupuesto-hogar-sin-estres",
    title: "Un presupuesto del hogar que no te robe el domingo",
    excerpt:
      "Olvida las hojas de cálculo infinitas. Así montas un sistema ligero que aguanta los meses raros y los gastos imprevistos.",
    date: "5 de junio, 2026",
    year: "2026",
    readingTime: "6 min",
    tag: "Método",
    tone: "yellow",
    cover: blogPresupuesto,
    content: [
      "Un presupuesto útil no es el que prevé cada céntimo, sino el que sobrevive al primer imprevisto sin que tires todo a la basura. La clave: pocas categorías, márgenes generosos y revisión mensual.",
      "Empieza con cinco bloques: vivienda, vida diaria, transporte, ocio y ahorro. Asigna un porcentaje aproximado y deja un 10% sin etiquetar para lo que siempre aparece (cumpleaños, una avería, un capricho compartido).",
      "Registrar movimientos no tiene que ser un trabajo extra. Hazlo en bloques de dos minutos al día o, mejor, en la revisión semanal con tu convivencia. Si tardas más de diez minutos, el sistema es demasiado complejo.",
      "Y recuerda: el objetivo no es ahorrar más este mes, sino sostener el método doce meses seguidos. Ahí es donde aparece el verdadero karma financiero.",
    ],
  },
  {
    slug: "objetivos-financieros-compartidos",
    title: "Objetivos compartidos: del 'algún día' al primer paso real",
    excerpt:
      "Viajar, mudarse, formar familia, dejar un trabajo. Convierte los grandes deseos en hitos medibles que de verdad ocurren.",
    date: "28 de mayo, 2026",
    year: "2026",
    readingTime: "4 min",
    tag: "Objetivos",
    tone: "blue",
    cover: blogObjetivos,
    content: [
      "La mayoría de los objetivos compartidos se quedan en conversación de sobremesa porque les falta una cosa: un número y una fecha. Sin eso, son intenciones, no planes.",
      "Define el objetivo en una frase concreta: 'Ahorrar 6.000 € para mudarnos en septiembre de 2027'. Ahora divide entre los meses que faltan. Ese es tu aporte mensual real, no una estimación romántica.",
      "Crea una cuenta o categoría separada para ese objetivo. Si vive mezclado con el día a día, desaparece. Si tiene su propio espacio, crece a la vista de todos.",
      "Revisa el avance una vez al mes, junto con tu presupuesto. Ver el porcentaje subir es lo que mantiene el hábito vivo cuando la motivación inicial se apaga.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
