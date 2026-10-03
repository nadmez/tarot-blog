import Link from "next/link";
import catImage from "../../assets/kawaiicat1.svg";

export const metadata = {
  title: "Sayfa yapım aşamasında | Tarot Falı",
};

export default function NotFound() {
  const catSrc =
    typeof catImage === "string"
      ? catImage
      : (catImage?.src ?? catImage?.default);

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-16 sm:px-6 sm:py-20">
      <img
        src={catSrc}
        alt="Süs amaçlı kedi illüstrasyonu"
        className="w-48 max-w-full sm:w-56"
      />
      <h1 className="font-heading text-2xl text-primary sm:text-3xl">
        Sayfa yapım aşamasında
      </h1>
      <Link
        href="/"
        className="rounded-full border border-primary/30 px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        Anasayfaya dön
      </Link>
    </div>
  );
}
