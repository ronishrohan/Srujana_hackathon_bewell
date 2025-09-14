import { DoubleArrowUpIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import React, { useRef, useState } from "react";
import { Button, Select, TextField, Spinner } from "@radix-ui/themes";
import { Sparkle } from "@phosphor-icons/react";
import { generateReply } from "../../util/generateReply";
import ReactMarkdown from "react-markdown";

const Assistant = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Fitness");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! How can I help you today?" },

  ]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim() || generating) return;
    setMessages((prev) => [
      ...prev,
      { type: "user", text: input.trim() },
    ]);
    setInput("");
    setGenerating(true);
    generateReply(input.trim(), "user", category).then((reply) => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: reply },
      ]);
      setGenerating(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }).catch(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Sorry, something went wrong." },
      ]);
      setGenerating(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    });
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Reset chat when category changes
  const handleCategoryChange = (value) => {
    setCategory(value);
    setMessages([
      { type: "bot", text: "Hello! How can I help you today?" }
    ]);
  };

  return (
    <div style={{width: open ? "900px" : "300px"}} className="transition-all duration-300 ease-in-out fixed bottom-0 flex-col bg-white/60 border-ruby-4 border backdrop-blur-2xl right-4 rounded-t-sm z-[100]  shadow-xl shadow-ruby-5">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="justify-between bg-gradient-to-t from-ruby-9 to-ruby-10 text-white flex w-full items-center px-4 text-left cursor-pointer border-ruby-7 p-2 rounded-t-sm h-[50px] font-[Cal_Sans]"
      >
        <div className="flex gap-2 items-center leading-3">
          <Sparkle weight="fill" /> Assistant
        </div>
        <DoubleArrowUpIcon
          style={{ rotate: open && "180deg" }}
          className="transition-all"
        />
      </button>
      
      <div
        style={{ height: open ? "80vh" : "0vh", paddingBlock: open ? "8px" : "0px" }}
        className={`shrink-0 transition-all min-h-0 overflow-hidden duration-300 ease-in-out flex flex-col gap-2 p-2`}
      >
        <div
          className="size-full flex flex-col overflow-auto"
          style={{ minHeight: 0, flex: 1 }}
        >
          <div className="flex flex-col gap-2 w-full h-full overflow-y-auto pr-2" style={{ flex: 1 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-fit px-4 py-2 rounded-sm ${msg.type === "user"
                    ? "bg-ruby-9 text-white"
                    : "bg-gray-100"
                    }`}
                  style={{ maxWidth: "70%" }}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {generating && (
              <div className="w-full flex justify-start">
                <div className="w-fit px-4 py-2 rounded-sm bg-gray-100 flex items-center" style={{ maxWidth: "70%" }}>
                  <Spinner size="2" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="gap-2 flex items-stretch">
          <TextField.Root
            placeholder="Type here..."
            size="3"
            className="w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={generating}
            ref={inputRef}
          />
          <Select.Root size="3" value={category} onValueChange={handleCategoryChange}>
            <Select.Trigger />
            <Select.Content >
              <Select.Item value="Fitness">Fitness</Select.Item>
              <Select.Item value="Sports">Sports</Select.Item>
              <Select.Item value="Mental">Mental</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button size="3" className="h-full" onClick={sendMessage} disabled={generating}>
            <PaperPlaneIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
