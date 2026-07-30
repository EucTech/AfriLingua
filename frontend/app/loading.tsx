import Image from "next/image";

export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6">
      <Image
        src="/images/logo-cropped.png"
        alt="AfriLingua"
        width={1190}
        height={284}
        className="h-8 w-auto"
        priority
      />
      <div className="bg-muted relative h-1 w-40 overflow-hidden rounded-full">
        <div className="bg-primary animate-loader-sweep absolute inset-y-0 w-1/3 rounded-full" />
      </div>
    </div>
  );
}
