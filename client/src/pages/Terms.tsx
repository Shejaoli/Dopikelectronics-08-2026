import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Terms of Service | Dopik Electronics</title>
        <meta name="description" content="Terms for using the Dopik Electronics website and YSOTA AI support assistant." />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-muted-foreground">Terms for using the Dopik Electronics website and its support features.</p>

        <section className="mt-10 space-y-4" aria-labelledby="shopping-information">
          <h2 id="shopping-information" className="text-xl font-semibold">Shopping information</h2>
          <p className="leading-7 text-muted-foreground">Product condition and included items are shown in each listing when provided. Contact us if you need us to confirm a product’s authenticity. Warranty and return terms may differ by product; confirm the terms for a specific item before ordering.</p>
          <p className="leading-7 text-muted-foreground">Checkout currently shows delivery as free. Our team may contact you to confirm your delivery address and coverage. Contact us for an estimated delivery time.</p>
          <p className="leading-7 text-muted-foreground">Checkout offers Cash on Delivery and MTN Mobile Money. A WhatsApp link starts an order request; it does not confirm or place an order automatically. Our team will confirm availability and next steps.</p>
          <p className="leading-7 text-muted-foreground">For product, payment, delivery, warranty, or return questions, <a href="/contact" className="font-medium text-primary underline underline-offset-4">contact our team</a>.</p>
        </section>

        <section className="mt-10 space-y-3" aria-labelledby="ai-assistant-terms">
          <h2 id="ai-assistant-terms" className="text-xl font-semibold">YSOTA AI assistant</h2>
          <p className="leading-7 text-muted-foreground">
            YSOTA AI uses OpenAI to generate responses to your questions. Do not share passwords, payment details, or private account information in the chat. AI responses may be inaccurate or incomplete; confirm product details, prices, stock, compatibility, and delivery with Dopik Electronics before making a purchase.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
