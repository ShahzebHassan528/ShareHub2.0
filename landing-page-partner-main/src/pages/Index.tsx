import { Heart, ShoppingBag, ArrowLeftRight, MapPin, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-illustration.jpg";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div className="container mx-auto flex items-center justify-between py-4 px-6">
      <a href="/" className="font-heading text-2xl text-primary">ShareHub</a>
      <div className="hidden md:flex items-center gap-8 font-body text-sm">
        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</a>
        <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
        <a href="#ngos" className="text-muted-foreground hover:text-foreground transition-colors">NGOs</a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">Log In</Button>
        <Button size="sm">Get Started</Button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            Community-Powered Sharing
          </motion.span>
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-6xl font-heading leading-tight text-foreground"
          >
            Share More,{" "}
            <span className="text-primary">Waste Less</span>
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-lg leading-relaxed"
          >
            Sell, donate, or swap clothes, books, and rations with your community. 
            Build connections while reducing waste and supporting those in need.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-4">
            <Button size="lg">Start Sharing</Button>
            <Button variant="outline" size="lg">Browse Items</Button>
          </motion.div>
          <motion.div custom={4} variants={fadeUp} className="flex items-center gap-6 pt-4">
            {[
              { label: "Active Users", value: "2K+" },
              { label: "Items Shared", value: "10K+" },
              { label: "NGOs Partnered", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-heading text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
            <img
              src={heroImage}
              alt="Community members sharing items in a park"
              width={1920}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const features = [
  {
    icon: ShoppingBag,
    title: "Sell Items",
    description: "List your unused items at fair prices and connect with local buyers easily.",
  },
  {
    icon: Heart,
    title: "Donate Goods",
    description: "Give to individuals or verified NGOs. Every donation creates a ripple of kindness.",
  },
  {
    icon: ArrowLeftRight,
    title: "Swap & Exchange",
    description: "Trade items you no longer need for something you do. Zero cost, maximum value.",
  },
  {
    icon: MapPin,
    title: "Location Search",
    description: "Find items and people nearby using integrated map-based search.",
  },
  {
    icon: Shield,
    title: "Verified NGOs",
    description: "Partner organizations are verified to ensure your donations reach the right hands.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Build connections in your neighborhood while promoting sustainable living.",
  },
];

const Features = () => (
  <section id="features" className="py-20 bg-card">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-14"
      >
        <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-heading text-foreground">
          Everything You Need to Share
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          A complete platform for selling, donating, and swapping items within your community.
        </motion.p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="group p-6 rounded-xl bg-background border border-border hover:shadow-[var(--shadow-soft)] transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const categories = [
  { name: "Clothes", emoji: "👕", description: "Shirts, pants, dresses, and more" },
  { name: "Books", emoji: "📚", description: "Textbooks, novels, and educational material" },
  { name: "Ration Items", emoji: "🍚", description: "Food packages and essential supplies" },
];

const Categories = () => (
  <section id="categories" className="py-20">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-14"
      >
        <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-heading text-foreground">
          What Can You Share?
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="mt-4 text-muted-foreground">
          Three categories focused on maximum community impact.
        </motion.p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="text-5xl mb-4">{cat.emoji}</div>
            <h3 className="font-heading text-2xl text-foreground mb-2">{cat.name}</h3>
            <p className="text-sm text-muted-foreground">{cat.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { step: "01", title: "Create an Account", description: "Sign up in seconds with your email" },
  { step: "02", title: "List Your Items", description: "Upload photos, set category and type" },
  { step: "03", title: "Connect Locally", description: "Find nearby buyers, donors, or swappers" },
  { step: "04", title: "Share & Impact", description: "Complete the exchange and make a difference" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 bg-card">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-14"
      >
        <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-heading text-foreground">
          How It Works
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="mt-4 text-muted-foreground">
          Four simple steps to start making a difference.
        </motion.p>
      </motion.div>
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-heading text-xl">
              {s.step}
            </div>
            <h3 className="font-heading text-lg text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const NGOSection = () => (
  <section id="ngos" className="py-20">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="rounded-2xl bg-primary p-10 md:p-16 text-center"
      >
        <motion.h2 custom={0} variants={fadeUp} className="text-3xl md:text-4xl font-heading text-primary-foreground">
          Are You an NGO?
        </motion.h2>
        <motion.p custom={1} variants={fadeUp} className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
          Register your organization on ShareHub to receive direct donations from community members.
          Get verified and start receiving clothes, books, and rations for those who need them most.
        </motion.p>
        <motion.div custom={2} variants={fadeUp} className="mt-8">
          <Button size="lg" variant="secondary">
            Register Your NGO
          </Button>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-heading text-xl text-primary mb-3">ShareHub</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A community-based platform promoting responsible sharing of household items.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm text-foreground mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Browse Items</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Sell</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Donate</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Swap</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm text-foreground mb-3">Community</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">NGO Partners</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm text-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 ShareHub. Built for communities, by communities.
      </div>
    </div>
  </footer>
);

const Index = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Categories />
    <HowItWorks />
    <NGOSection />
    <Footer />
  </>
);

export default Index;
