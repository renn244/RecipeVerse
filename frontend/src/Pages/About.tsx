import { Link } from "react-router-dom"
import { UtensilsCrossedIcon, UsersIcon, HeartHandshakeIcon, ShieldCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/PageComponents/Footer"

const values = [
  { icon: UtensilsCrossedIcon, title: 'Real food, real cooks', body: 'Recipes come from people who actually make them at home, with honest cooking times, servings and cost.' },
  { icon: UsersIcon, title: 'Community first', body: 'Comments, ratings, likes and follows help good recipes rise and help cooks improve them.' },
  { icon: HeartHandshakeIcon, title: 'Easy to share', body: 'Posting a recipe should take minutes. Save it as a draft, add photos, and publish when it is ready.' },
  { icon: ShieldCheckIcon, title: 'Your account, protected', body: 'Optional two-factor login, secure password reset, and you can delete your account and data at any time.' },
]

const features = [
  'Post recipes with photos, ingredients, instructions, cooking time, servings and cost',
  'Explore with search and filters for meal type, cuisine, preference and budget',
  'Rate recipes from 1 to 5 stars, like them, and save them to your Saved list',
  'Comment and reply, follow other cooks, and get real-time notifications',
  'Keep unfinished recipes as drafts and see your stats on the My Recipes dashboard',
]

const About = () => {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-4">About RecipeVerse</p>
        <h1 className="text-5xl font-bold leading-tight mb-6">A shared cookbook, written by everyone who cooks.</h1>
        <p className="text-xl text-muted-foreground">
          RecipeVerse started from a simple idea: the best recipes are the ones people make again and again at home.
          It is a place to keep those recipes, share them, and find new ones from cooks you can talk to.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-3">Our vision</h2>
          <p className="text-muted-foreground text-lg">
            A world where nobody has to wonder what to cook tonight, because a community of home cooks has already
            shared, tested and rated the answer.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Our mission</h2>
          <p className="text-muted-foreground text-lg">
            Make it effortless to share a recipe and genuinely useful to discover one, with honest details,
            helpful ratings and friendly conversation around every dish.
          </p>
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">What we care about</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-5">What you can do here</h2>
        <ul className="space-y-3 text-lg">
          {features.map((f) => (
            <li key={f} className="flex gap-3"><span className="text-amber-600 font-bold">✓</span>{f}</li>
          ))}
        </ul>
        <div className="flex gap-3 mt-10">
          <Button asChild size="lg"><Link to="/explore">Explore recipes</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/myrecipe/create">Share a recipe</Link></Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About
