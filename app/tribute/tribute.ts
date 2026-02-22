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
    name: "NILIMA KUMAR",
    year: "11/11/1968 – 14/08/2012",
    text: "I pay my tribute to my mother, who fought cancer before me and whose blessings carried me through it, guiding every life I now serve.",
    image: "/tribute/nilimakumar.jpeg",
  },
  {
    name: "PRATIMA SAHA ROY",
    year: "1947–2016",
    text: "As I referred to her 'Dida' was an amazing person always by my side.",
    image: "/tribute/pratimasaharoy.jpeg",
  },
  // {
  //   name: "Jane Foster",
  //   year: "1965–2021",
  //   text: "A constant source of inspiration, kindness, and wisdom.",
  //   image: "/tribute/janefoster.png",
  // },
];
