export interface Tribute {
  name: string;
  year: string; // birth-death
  text: string;
  // optional image path relative to public; if omitted it will be inferred from name
  image: string;
}

// data for tribute page
export const tributes: Tribute[] = [
  {
    name: "John Doe",
    year: "1950–2020",
    text: "Beloved community leader who dedicated his life to helping others.",
    image: "/tribute/johndoe.png",
  },
  {
    name: "BARSHA CHAKRABORTY",
    year: "30th April 1982- 28th March 2018",
    text: "",
    image: "/tribute/barshachakraborty.jpeg",
  },
  {
    name: "Alan Smithee",
    year: "1970–2022",
    text: "Devoted mentor and friend, always willing to lend an ear.",
    image: "/tribute/alansmithee.png",
  },
  {
    name: "Jane Smith",
    year: "1965–2021",
    text: "A constant source of inspiration, kindness, and wisdom.",
    image: "/tribute/janesmith.png",
  },
  {
    name: "Jane Foster",
    year: "1965–2021",
    text: "A constant source of inspiration, kindness, and wisdom.",
    image: "/tribute/janefoster.png",
  },
  {
    name: "Alan Smith",
    year: "1965–2021",
    text: "A constant source of inspiration, kindness, and wisdom.",
    image: "/tribute/Alansmith.png",
  },
];
