import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-muted-foreground">
        <p><span className="font-semibold text-foreground">Recipe Verse</span> · share what you cook</p>
        <nav className="flex gap-6">
          <Link className="hover:underline underline-offset-4" to="/">Home</Link>
          <Link className="hover:underline underline-offset-4" to="/explore">Explore</Link>
          <Link className="hover:underline underline-offset-4" to="/about">About</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
