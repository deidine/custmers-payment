import StarFull from "../../public/images/star-full.svg";
import StarHalf from "../../public/images/star-half.svg";
import StarEmpty from "../../public/images/star-empty.svg";

export default function ReviewStars({ rating }: { rating: number }) {
  const numberOfStars = 5;
  let starsFull = 0;
  let starsHalf = 0;
  let starsEmpty = 0;

  if (rating > 0 && rating <= numberOfStars) {
    starsFull = Math.floor(rating);
    if (rating !== starsFull) {
      starsHalf = 1;
    }
    starsEmpty = numberOfStars - (starsFull + starsHalf);
  } else {
    starsEmpty = numberOfStars;
  }

  const styles = {
    width: "20px",
    height: "20px",
    display: "inline-block",
    fill: "gold",
  };

  return (
    <div>
      {Array.from({ length: starsFull }).map((_, index) => (
        <StarFull key={index} style={styles} />
      ))}

      {Array.from({ length: starsHalf }).map((_, index) => (
        <StarHalf key={index} style={styles} />
      ))}

      {Array.from({ length: starsEmpty }).map((_, index) => (
        <StarEmpty key={index} style={styles} />
      ))}
    </div>
  );
}
