export default interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}