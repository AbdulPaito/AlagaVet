import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  message: string;
};

export function TestimonialsCarousel() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,name,location,rating,message")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  if (items.length === 0) return null;
  // duplicate for infinite marquee
  const loop = [...items, ...items];

  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Trusted by Filipino farmers 🇵🇭</h2>
          <p className="mt-2 text-muted-foreground">Real reviews from real customers.</p>
        </div>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track flex w-max gap-5 px-4">
          {loop.map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="card-premium card-hover w-[320px] shrink-0 p-6 sm:w-[380px]"
            >
              <div className="mb-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={
                      k < t.rating
                        ? "h-4 w-4 fill-warning text-warning"
                        : "h-4 w-4 text-muted-foreground/40"
                    }
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-foreground/90">"{t.message}"</p>
              <div className="text-sm">
                <div className="font-semibold">{t.name}</div>
                {t.location && (
                  <div className="text-xs text-muted-foreground">{t.location}</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
