import type { ImageMetadata } from 'astro';

import bemDeFamiliaImpenhorabilidade from '../assets/blog/bem-de-familia-impenhorabilidade.jpg';
import impactosTecnologiaDireitoTributario from '../assets/blog/impactos-tecnologia-direito-tributario.jpg';
import isencaoRestituicaoImpostoDeRendaPensaoAlimenticia from '../assets/blog/isencao-restituicao-imposto-de-renda-pensao-alimenticia.jpg';
import leiContraBullyingCriancasAdolescentes from '../assets/blog/lei-contra-bullying-criancas-adolescentes.jpg';
import lgpdSuaImportanciaEAdequacao from '../assets/blog/lgpd-sua-importancia-e-adequacao.jpg';
import planejamentoTributarioClinicaMedicaOdontologicaEquiparacao from '../assets/blog/planejamento-tributario-clinica-medica-odontologica-equiparacao.webp';
import regulamentacaoTributacaoCasasDeApostasBets from '../assets/blog/regulamentacao-tributacao-casas-de-apostas-bets.jpg';
import restituicaoInssAcimaTetoDiversasFontesPagadoras from '../assets/blog/restituicao-inss-acima-teto-diversas-fontes-pagadoras.jpeg';
import simplesNacionalQuemPodeAderir from '../assets/blog/simples-nacional-quem-pode-aderir.jpg';
import tributacaoLucroRealLucroPresumido from '../assets/blog/tributacao-lucro-real-lucro-presumido.jpg';
import tributosVinculadosENaoVinculados from '../assets/blog/tributos-vinculados-e-nao-vinculados.jpg';

/*
 * Capa de cada artigo, migrada do og:image do post correspondente no
 * WordPress original (wordpress-export/<slug>/index.html). Chave = post.id
 * da content collection (src/content/artigos/<slug>.md).
 */
export const blogImages: Record<string, ImageMetadata> = {
  'bem-de-familia-impenhorabilidade': bemDeFamiliaImpenhorabilidade,
  'impactos-tecnologia-direito-tributario': impactosTecnologiaDireitoTributario,
  'isencao-restituicao-imposto-de-renda-pensao-alimenticia':
    isencaoRestituicaoImpostoDeRendaPensaoAlimenticia,
  'lei-contra-bullying-criancas-adolescentes': leiContraBullyingCriancasAdolescentes,
  'lgpd-sua-importancia-e-adequacao': lgpdSuaImportanciaEAdequacao,
  'planejamento-tributario-clinica-medica-odontologica-equiparacao':
    planejamentoTributarioClinicaMedicaOdontologicaEquiparacao,
  'regulamentacao-tributacao-casas-de-apostas-bets': regulamentacaoTributacaoCasasDeApostasBets,
  'restituicao-inss-acima-teto-diversas-fontes-pagadoras':
    restituicaoInssAcimaTetoDiversasFontesPagadoras,
  'simples-nacional-quem-pode-aderir': simplesNacionalQuemPodeAderir,
  'tributacao-lucro-real-lucro-presumido': tributacaoLucroRealLucroPresumido,
  'tributos-vinculados-e-nao-vinculados': tributosVinculadosENaoVinculados,
};
