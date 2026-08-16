// morphyn - card preview for the hosted studio.
// the live app is https://morphyn.fly.dev/studio. this file is
// only the index-card media: the brand mark on the same dotted canvas the
// other experiment cards use.

export default function MorphynCard() {
  return (
    <div className="morphyn-card" aria-hidden>
      <img
        className="morphyn-card-icon"
        src="/experiments/brand/morphyn.png"
        alt=""
        width={220}
        height={220}
        draggable={false}
      />
      <img
        className="morphyn-card-wordmark"
        src="/experiments/brand/morphyn-wordmark-dark.png"
        alt=""
        width={1024}
        height={201}
        draggable={false}
      />
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.morphyn-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
.morphyn-card-icon {
  width: 220px;
  height: 220px;
  border-radius: 48px;
  box-shadow: 0 22px 48px rgba(0,0,0,0.45);
}
.morphyn-card-wordmark {
  height: 48px;
  width: auto;
}
`;
