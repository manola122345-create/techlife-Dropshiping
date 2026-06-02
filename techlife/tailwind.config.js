export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: { extend: {
    colors: {
      brand: { 50:"#fff7ed",100:"#ffedd5",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",900:"#7c2d12" }
    },
    fontFamily: { sans: ["Inter","system-ui","sans-serif"] }
  }},
  plugins: []
}
