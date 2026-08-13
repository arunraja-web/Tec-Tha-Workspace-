import React from 'react';

export const TypingIndicator = ({ typingUsersMap = {} }) => {
  const userNames = Object.values(typingUsersMap);

  if (userNames.length === 0) return null;

  let text = 'is typing...';
  if (userNames.length === 1) {
    text = `${userNames[0]} is typing...`;
  } else if (userNames.length === 2) {
    text = `${userNames[0]} and ${userNames[1]} are typing...`;
  } else {
    text = `${userNames[0]} and ${userNames.length - 1} others are typing...`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in duration-200">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
      </div>
      <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;
