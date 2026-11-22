import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ChefHatIcon, SearchIcon, StarIcon, BookmarkIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RecipeCollection from "@/PageComponents/explore/RecipeCollection"
import Footer from "@/PageComponents/Footer"
import { useAuthContext } from "@/context/authContext"
import { API_URL } from '@/lib/api'

const steps = [
  { icon: ChefHatIcon, title: 'Share your recipes', body: 'Post the dishes you love with photos, ingredients, cooking time and cost. Save drafts and publish when ready.' },
  { icon: SearchIcon, title: 'Discover new dishes', body: 'Search by name and filter by meal type, cuisine, preference and budget to find what to cook tonight.' },
  { icon: StarIcon, title: 'Rate and talk about it', body: 'Like, rate and comment on recipes, follow cooks you enjoy, and get notified when people react to yours.' },
  { icon: BookmarkIcon, title: 'Keep your favorites', body: 'Bookmark recipes to your Saved list so the good ones are always one click away.' },
]

const Home = () => {
  const { user } = useAuthContext()

  const { data, isLoading } = useQuery({
    queryKey: ['homeLatest'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/recipe/getRecipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1 }),
        credentials: 'include'
      })
      return res.json()
    },
  })
  const latest = (data?.posts ?? []).slice(0, 8)
  const heroPhotos: string[] = (data?.posts ?? []).map((p: any) => p.recipe?.image?.[0]).filter(Boolean).slice(0, 3)

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-4">A home for home cooks</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Cook it. Share it.<br />Rate it.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            RecipeVerse is where people share the recipes they actually cook, from weeknight adobo to weekend desserts, and help each other decide what to make next.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg" className="text-base">
              <Link to="/explore">Explore recipes <ArrowRightIcon className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to={user ? '/myrecipe/create' : '/signUp'}>{user ? 'Share a recipe' : 'Join for free'}</Link>
            </Button>
          </div>
        </div>

        <div aria-hidden className="relative h-[380px] hidden md:block">
          {heroPhotos.length > 0 ? heroPhotos.map((src, i) => (
            <img key={src} src={src} alt=""
            className={[
              "absolute rounded-2xl shadow-xl object-cover border-4 border-background",
              i === 0 && "w-[300px] h-[220px] left-0 top-6 -rotate-3",
              i === 1 && "w-[260px] h-[190px] right-4 top-0 rotate-3",
              i === 2 && "w-[280px] h-[200px] left-24 bottom-0 rotate-1",
            ].filter(Boolean).join(' ')} />
          )) : (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/30 flex items-center justify-center">
              <ChefHatIcon className="h-32 w-32 text-amber-600/70" />
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Fresh from the community</h2>
              <p className="text-muted-foreground mt-1">The newest recipes people have shared.</p>
            </div>
            <Link to="/explore" className="font-medium hover:underline underline-offset-4">See all recipes →</Link>
          </div>
          {!isLoading && latest.length === 0 ? (
            <p className="text-muted-foreground">No recipes yet. Be the first to share one!</p>
          ) : (
            <RecipeCollection className="h-auto max-w-none" loading={isLoading} recipeCollection={latest} />
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-2">How it works</h2>
        <p className="text-muted-foreground mb-10">Everything you need to keep and share your cooking.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {!user && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="rounded-3xl bg-primary text-primary-foreground px-10 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Got a recipe people should try?</h2>
              <p className="opacity-80 text-lg">Create a free account and post it in a couple of minutes.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/signUp">Create an account</Link>
            </Button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default Home
