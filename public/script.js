document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
      nome: document.getElementById("name").value.trim(),
      descricao: `
            Sobrenome: ${document.getElementById("sobrenome").value.trim()}
            | Nascimento: ${document.getElementById("idade").value}
            | Gênero: ${document.getElementById("genero").value}
            | E-mail: ${document.getElementById("email").value}
          `,
      senha: document.getElementById("senha").value, // Armazenar senha aqui é apenas para fins educacionais
    };

    try {
      const resposta = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        alert("Erro: " + erro.message);
        return;
      }

      const resultado = await resposta.json();
      alert("Cadastro realizado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro ao enviar dados para o servidor.");
    }
  });
});
