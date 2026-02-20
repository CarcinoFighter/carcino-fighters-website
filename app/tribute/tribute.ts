export interface Tribute {
  name: string;
  year: string; // birth-death
  text: string;
  // optional image path relative to public; if omitted it will be inferred from name
  image: string;
}

// data for tribute page
export const tributes: Tribute[] = [
  // {
  //   name: "John Doe",
  //   year: "1950–2020",
  //   text: "Beloved community leader who dedicated his life to helping others.",
  //   image: "/tribute/johndoe.png",
  // },
  {
    name: "BARSHA CHAKRABORTY",
    year: "30/04/1982 – 28/03/2018",
    text: "",
    image: "/tribute/barshachakraborty.jpeg",
  },
  {
    name: "Nilima Kumar",
    year: "11/11/1968 – 14/08/2012",
    text: "",
    image: "/tribute/nilimakumar.jpeg",
  },
  // {
  //   name: "Jane Smith",
  //   year: "1965–2021",
  //   text: "A constant source of inspiration, kindness, and wisdom.",
  //   image: "/tribute/janesmith.png",
  // },
  // {
  //   name: "Jane Foster",
  //   year: "1965–2021",
  //   text: "A constant source of inspiration, kindness, and wisdom.",
  //   image: "/tribute/janefoster.png",
  // },
];
