const paths = {
  search: "M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z",
  pin: "M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z M12 13a3 3 0 100-6 3 3 0 000 6z",
  wind: "M3 8h11a3 3 0 100-6M3 12h16a3 3 0 110 6h-2M3 16h7",
  drop: "M12 3s6 6.4 6 11a6 6 0 11-12 0c0-4.6 6-11 6-11z",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M12 15a3 3 0 100-6 3 3 0 000 6z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
};

export default function Icon({ name }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
