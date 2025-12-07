export type CodeEditorProps = {
  value: string;
  language?: string;
  readOnly?: boolean;
  filePath?: string | null;
};

export type BlameLine = {
  author: string;
  author_email: string;
  timestamp: number;
  line_number: number;
  commit_hash: string;
  commit_message: string;
};
