import re

def clean_sql_from_response(response_text: str) -> str:
    match = re.search(r"```sql\s*(.*?)```", response_text, re.DOTALL)
    sql_code = match.group(1) if match else response_text
    lines = sql_code.splitlines()
    return "\n".join([line for line in lines if not line.strip().startswith("--")]).strip()

def clean_json_from_response(response_text: str) -> str:
    match = re.search(r"```json\n(.*?)```", response_text, re.DOTALL)
    response_text = re.sub(r"//.*", "", response_text)
    response_text = remove_json_line_comments(response_text)
    return match.group(1).strip() if match else response_text.strip()

def remove_json_line_comments(json_str: str) -> str:
    cleaned_lines = []
    for line in json_str.splitlines():
        if '//' in line:
            quote_open = False
            new_line = ''
            i = 0
            while i < len(line):
                if line[i] == '"':
                    quote_open = not quote_open
                if not quote_open and line[i:i+2] == '//':
                    break
                new_line += line[i]
                i += 1
            cleaned_lines.append(new_line.rstrip())
        else:
            cleaned_lines.append(line.rstrip())
    return '\n'.join(cleaned_lines)
