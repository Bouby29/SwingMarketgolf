const BRANDS = [
  { name: "Titleist", domain: "titleist.com" },
  { name: "Callaway", domain: "callawaygolf.com" },
  { name: "TaylorMade", domain: "taylormadegolf.com" },
  { name: "Ping", domain: "ping.com" },
  { name: "Cobra", domain: "cobragolf.com" },
  { name: "Mizuno", domain: "mizunousa.com" },
  { name: "Cleveland", domain: "clevelandgolf.com" },
  { name: "Srixon", domain: "srixon.com" },
  { name: "Bridgestone", domain: "bridgestonegolf.com" },
  { name: "Wilson", domain: "wilson.com" },
  { name: "Odyssey", domain: "odysseygolf.com" },
  { name: "PXG", domain: "pxg.com" },
  { name: "Honma", domain: "honmagolf.com" },
  { name: "MacGregor", domain: "macgregorgolf.com" },
  { name: "Ben Hogan", domain: "benhoganequipment.com" },
];

export default function BrandCarousel() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div style={{
      background: "#fff",
      borderTop: "1px solid #e9ecef",
      borderBottom: "1px solid #e9ecef",
      padding: "32px 0",
    }}>
      <p style={{
        textAlign: "center",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        color: "#bbb",
        marginBottom: 24,
        textTransform: "uppercase",
      }}>
        Toutes les grandes marques
      </p>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 100,
          background: "linear-gradient(to right, #fff, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 100,
          background: "linear-gradient(to left, #fff, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 48,
          animation: "brandScroll 35s linear infinite",
          width: "max-content",
        }}>
          {doubled.map((brand, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              minWidth: 90,
            }}>
              <img
                src={`https://logo.clearbit.com/${brand.domain}`}
                alt={brand.name}
                style={{
                  height: 36,
                  width: "auto",
                  maxWidth: 90,
                  objectFit: "contain",
                  filter: "grayscale(100%)",
                  opacity: 0.7,
                  transition: "all 0.2s",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span style={{
                display: "none",
                fontSize: 13,
                fontWeight: 700,
                color: "#1B5E20",
              }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes brandScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
