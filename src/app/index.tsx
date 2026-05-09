import { Redirect } from "expo-router";
import dayjs from "dayjs";

export default function Index() {
  const currentYear = dayjs().format("YYYY");
  return <Redirect href={`/${currentYear}`} />;
}
