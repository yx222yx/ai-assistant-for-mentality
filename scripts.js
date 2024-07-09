async function fetchAIResponse(question) {
    const url = 'https://spark-api-open.xf-yun.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer d67aabc2:50c5ab8bb0cc9044df531471f3f7e640:MDU0OGM0N2YwZDQxMmRiMDlkYzg5Yjhh'
    };
    const data = {
        "model": "4.0Ultra",
        "messages": [
            {
                "role": "user",
                "content": question
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching the answer:', error);
        return 'Error fetching the answer.';
    }
}

document.getElementById('askForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // 阻止默认表单提交

    const question = document.getElementById('question').value;

    // 显示用户问题
    const chatHistory = document.getElementById('chatHistory');
    const userMessage = document.createElement('div');
    userMessage.classList.add('message');
    userMessage.innerHTML = `<p class="question">Q: ${question}</p>`;
    chatHistory.appendChild(userMessage);

    // 清空输入框
    document.getElementById('question').value = '';

    // 调用后端API获取回答
    const answer = await fetchAIResponse(question);

    // 显示AI回答
    const aiMessage = document.createElement('div');
    aiMessage.classList.add('message');
    aiMessage.innerHTML = `<p class="answer">A: ${answer}</p>`;
    chatHistory.appendChild(aiMessage);
});
