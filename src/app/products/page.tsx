import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DEMO_PRODUCTS = [
  {
    id: "1",
    name: "COSRX Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Essence",
    price: "₩16,900",
    concerns: ["Hydration", "Repair", "Anti-aging"],
    rating: 4.8,
  },
  {
    id: "2",
    name: "Beauty of Joseon Glow Serum",
    brand: "Beauty of Joseon",
    category: "Serum",
    price: "₩12,000",
    concerns: ["Brightening", "Hydration", "Glow"],
    rating: 4.7,
  },
  {
    id: "3",
    name: "SKIN1004 Madagascar Centella Ampoule",
    brand: "SKIN1004",
    category: "Ampoule",
    price: "₩18,000",
    concerns: ["Calming", "Sensitivity", "Redness"],
    rating: 4.6,
  },
  {
    id: "4",
    name: "Anua Heartleaf 77% Soothing Toner",
    brand: "Anua",
    category: "Toner",
    price: "₩19,800",
    concerns: ["Pore Care", "Soothing", "Oil Control"],
    rating: 4.7,
  },
  {
    id: "5",
    name: "Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum",
    brand: "Torriden",
    category: "Serum",
    price: "₩17,500",
    concerns: ["Deep Hydration", "Plumping", "Barrier"],
    rating: 4.8,
  },
  {
    id: "6",
    name: "Isntree Hyaluronic Acid Toner",
    brand: "Isntree",
    category: "Toner",
    price: "₩14,800",
    concerns: ["Hydration", "Soothing", "All Skin Types"],
    rating: 4.5,
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1.5 rounded-full text-xs tracking-wider border border-border/50"
          >
            K-Beauty Database
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Product <span className="gradient-text">Catalog</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Curated K-Beauty products rated by AI analysis, ingredient quality,
            and user reviews.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            "All",
            "Toner",
            "Serum",
            "Essence",
            "Ampoule",
            "Moisturizer",
            "Sunscreen",
            "Cleanser",
          ].map((cat) => (
            <Button
              key={cat}
              variant={cat === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEMO_PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className="glass-card rounded-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="text-[10px] rounded-full px-2"
                  >
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{product.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {product.brand} · {product.price}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.concerns.map((c) => (
                    <Badge
                      key={c}
                      className="text-[9px] px-1.5 py-0 rounded-full bg-primary/5 text-primary border-0"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Full product database with 300+ products coming soon.
          </p>
          <Button
            variant="outline"
            className="rounded-full border-border/50"
            asChild
          >
            <Link href="/consultation">
              Get AI Recommendations Instead →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
