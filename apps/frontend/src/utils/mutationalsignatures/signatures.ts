import { IMutationalSignature } from '../../types/MutationalSignatures.types';

const signatures: IMutationalSignature[] = [
  // Placeholder
  {
    cancers: [],
    cancersFull: '',
    aetiology: '',
    aetiologyFull: '',
    features: '',
    comments: '',
  },
  // Signature 1
  {
    cancers: ['All cancers'],
    cancersFull: 'Signature 1 has been found in all cancer types and in most cancer samples',
    aetiology: 'Endogenous Mutational Process',
    aetiologyFull: 'Signature 1 is the result of an endogenous mutational process initiated by spontaneous deamination of 5-methylcytosine',
    features: 'Signature 1 is associated with small numbers of small insertions and deletions in most tissue types',
    comments: 'The number of Signature 1 mutations correlates with age of cancer diagnosis',
  },
  // Signature 2
  {
    cancers: ['Bladder', 'Cervical'],
    cancersFull: 'Signature 2 has been found in 22 cancer types, but most commonly in cervical and bladder cancers. In most of these 22 cancer types, Signature 2 is present in at least 10% of samples',
    aetiology: 'AID/APOBEC',
    aetiologyFull: 'Signature 2 has been attributed to activity of the AID/APOBEC family of cytidine deaminases. On the basis of similarities in the sequence context of cytosine mutations caused by APOBEC enzymes in experimental systems, a role for APOBEC1, APOBEC3A and/or APOBEC3B in human cancer appears more likely than for other members of the family',
    features: 'Transcriptional strand bias of mutations has been observed in exons, but is not present or is weaker in introns',
    comments: 'Signature 2 is usually found in the same samples as Signature 13. It has been proposed that activation of AID/APOBEC cytidine deaminases is due to viral infection, retrotransposon jumping or to tissue inflammation. Currently, there is limited evidence to support these hypotheses. A germline deletion polymorphism involving APOBEC3A and APOBEC3B is associated with the presence of large numbers of Signature 2 and 13 mutations and with predisposition to breast cancer. Mutations of similar patterns to Signatures 2 and 13 are commonly found in the phenomenon of local hypermutation present in some cancers, known as kataegis, potentially implicating AID/APOBEC enzymes in this process as well',
  },
  // Signature 3
  {
    cancers: ['Breast', 'Ovarian', 'Pancreatic'],
    cancersFull: 'Signature 3 has been found in breast, ovarian, and pancreatic cancers',
    aetiology: 'HR Repair Failure ',
    aetiologyFull: 'Signature 3 is associated with failure of DNA double-strand break-repair by homologous recombination',
    features: 'Signature 3 associates strongly with elevated numbers of large (longer than 3bp) insertions and deletions with overlapping microhomology at breakpoint junctions',
    comments: 'Signature 3 is strongly associated with germline and somatic BRCA1 and BRCA2 mutations in breast, pancreatic, and ovarian cancers. In pancreatic cancer, responders to platinum therapy usually exhibit Signature 3 mutations',
  },
  // Signature 4
  {
    cancers: ['Head', 'Neck', 'Liver', 'Oesophageal', 'Lung Adenocarcinoma', 'Lung Squamous Carcinoma', 'Small Cell Lung Carcinoma'],
    cancersFull: 'Signature 4 has been found in head and neck cancer, liver cancer, lung adenocarcinoma, lung squamous carcinoma, small cell lung carcinoma, and oesophageal cancer',
    aetiology: 'Smoking (tobacco mutagens)',
    aetiologyFull: 'Signature 4 is associated with smoking and its profile is similar to the mutational pattern observed in experimental systems exposed to tobacco carcinogens (e.g., benzo[a]pyrene). Signature 4 is likely due to tobacco mutagens',
    features: 'Signature 4 exhibits transcriptional strand bias for C>A mutations, compatible with the notion that damage to guanine is repaired by transcription-coupled nucleotide excision repair. Signature 4 is also associated with CC>AA dinucleotide substitutions',
    comments: 'Signature 29 is found in cancers associated with tobacco chewing and appears different from Signature 4',
  },
  // Signature 5
  {
    cancers: ['All cancers'],
    cancersFull: 'Signature 5 has been found in all cancer types and most cancer samples',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 5 is unknown',
    features: 'Signature 5 exhibits transcriptional strand bias for T>C substitutions at ApTpN context',
    comments: '',
  },
  // Signature 6
  {
    cancers: ['Colorectal', 'Uterine'],
    cancersFull: 'Signature 6 has been found in 17 cancer types and is most common in colorectal and uterine cancers. In most other cancer types, Signature 6 is found in less than 3% of examined samples',
    aetiology: 'Defective DNA mismatch repair',
    aetiologyFull: 'Signature 6 is associated with defective DNA mismatch repair and is found in microsatellite unstable tumours',
    features: 'Signature 6 is associated with high numbers of small (shorter than 3bp) insertions and deletions at mono/polynucleotide repeats',
    comments: 'Signature 6 is one of four mutational signatures associated with defective DNA mismatch repair and is often found in the same samples as Signatures 15, 20, and 26',
  },
  // Signature 7
  {
    cancers: ['Skin', 'Lip / Oral Squamous'],
    cancersFull: 'Signature 7 has been found predominantly in skin cancers and in cancers of the lip categorized as head and neck or oral squamous cancers',
    aetiology: 'UV exposure',
    aetiologyFull: 'Based on its prevalence in ultraviolet exposed areas and the similarity of the mutational pattern to that observed in experimental systems exposed to ultraviolet light Signature 7 is likely due to ultraviolet light exposure',
    features: 'Signature 7 is associated with large numbers of CC>TT dinucleotide mutations at dipyrimidines. Additionally, Signature 7 exhibits a strong transcriptional strand-bias indicating that mutations occur at pyrimidines (viz., by formation of pyrimidine-pyrimidine photodimers) and these mutations are being repaired by transcription-coupled nucleotide excision repair',
    comments: '',
  },
  // Signature 8
  {
    cancers: ['Breast', 'Medulloblastoma'],
    cancersFull: 'Signature 8 has been found in breast cancer and medulloblastoma',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 8 remains unknown',
    features: 'Signature 8 exhibits weak strand bias for C>A substitutions and is associated with double nucleotide substitutions, notably CC>AA',
    comments: '',
  },
  // Signature 9
  {
    cancers: ['Lymphocytic Leukaemia', 'B-cell Lymphoma'],
    cancersFull: 'Signature 9 has been found in chronic lymphocytic leukaemias and malignant B-cell lymphomas',
    aetiology: 'Polymerase η mutations',
    aetiologyFull: 'Signature 9 is characterized by a pattern of mutations that has been attributed to polymerase η, which is implicated with the activity of AID during somatic hypermutation',
    features: '',
    comments: 'Chronic lymphocytic leukaemias that possess immunoglobulin gene hypermutation (IGHV-mutated) have elevated numbers of mutations attributed to Signature 9 compared to those that do not have immunoglobulin gene hypermutation',
  },
  // Signature 10
  {
    cancers: ['Colorectal', 'Uterine'],
    cancersFull: 'Signature 10 has been found in six cancer types, notably colorectal and uterine cancer, usually generating huge numbers of mutations in small subsets of samples',
    aetiology: 'Altered activity of POLE',
    aetiologyFull: 'It has been proposed that the mutational process underlying this signature is altered activity of the error-prone polymerase POLE. The presence of large numbers of Signature 10 mutations is associated with recurrent POLE somatic mutations, viz., Pro286Arg and Val411Leu',
    features: 'Signature 10 exhibits strand bias for C>A mutations at TpCpT context and T>G mutations at TpTpT context',
    comments: 'Signature 10 is associated with some of most mutated cancer samples. Samples exhibiting this mutational signature have been termed ultra-hypermutators',
  },
  // Signature 11
  {
    cancers: ['Melanoma', 'Glioblastoma'],
    cancersFull: 'Signature 11 has been found in melanoma and glioblastoma',
    aetiology: 'Alkylating agents',
    aetiologyFull: 'Signature 11 exhibits a mutational pattern resembling that of alkylating agents. Patient histories have revealed an association between treatments with the alkylating agent temozolomide and Signature 11 mutations',
    features: 'Signature 11 exhibits a strong transcriptional strand-bias for C>T substitutions indicating that mutations occur on guanine and that these mutations are effectively repaired by transcription-coupled nucleotide excision repair',
    comments: '',
  },
  // Signature 12
  {
    cancers: ['Liver'],
    cancersFull: 'Signature 12 has been found in liver cancer',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 12 remains unknown',
    features: 'Signature 12 exhibits a strong transcriptional strand-bias for T>C substitutions',
    comments: 'Signature 12 usually contributes a small percentage (<20%) of the mutations observed in a liver cancer sample',
  },
  // Signature 13
  {
    cancers: ['Cervical', 'Bladder'],
    cancersFull: 'Signature 13 has been found in 22 cancer types and seems to be commonest in cervical and bladder cancers. In most of these 22 cancer types, Signature 13 is present in at least 10% of samples',
    aetiology: 'AID/APOBEC C>T',
    aetiologyFull: 'Signature 13 has been attributed to activity of the AID/APOBEC family of cytidine deaminases converting cytosine to uracil. On the basis of similarities in the sequence context of cytosine mutations caused by APOBEC enzymes in experimental systems, a role for APOBEC1, APOBEC3A and/or APOBEC3B in human cancer appears more likely than for other members of the family. Signature 13 causes predominantly C>G mutations. This may be due to generation of abasic sites after removal of uracil by base excision repair and replication over these abasic sites by REV1',
    features: 'Transcriptional strand bias of mutations has been observed in exons, but is not present or is weaker in introns',
    comments: 'Signature 2 is usually found in the same samples as Signature 13. It has been proposed that activation of AID/APOBEC cytidine deaminases is due to viral infection, retrotransposon jumping or to tissue inflammation. Currently, there is limited evidence to support these hypotheses. A germline deletion polymorphism involving APOBEC3A and APOBEC3B is associated with the presence of large numbers of Signature 2 and 13 mutations and with predisposition to breast cancer. Mutations of similar patterns to Signatures 2 and 13 are commonly found in the phenomenon of local hypermutation present in some cancers, known as kataegis, potentially implicating AID/APOBEC enzymes in this process as well',
  },
  // Signature 14
  {
    cancers: ['Uterine', 'Low-grade Glioma'],
    cancersFull: 'Signature 14 has been observed in four uterine cancers and a single adult low-grade glioma sample',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 14 remains unknown',
    features: '',
    comments: 'Signature 14 generates very high numbers of somatic mutations (>200 mutations per MB) in all samples in which it has been observed',
  },
  // Signature 15
  {
    cancers: ['Stomach', 'Lung Carcinoma'],
    cancersFull: 'Signature 15 has been found in several stomach cancers and a single small cell lung carcinoma',
    aetiology: 'Defective DNA mismatch repair',
    aetiologyFull: 'Signature 15 is associated with defective DNA mismatch repair',
    features: 'Signature 15 is associated with high numbers of small (shorter than 3bp) insertions and deletions at mono/polynucleotide repeats',
    comments: 'Signature 15 is one of four mutational signatures associated with defective DNA mismatch repair and is often found in the same samples as Signatures 6, 20, and 26',
  },
  // Signature 16
  {
    cancers: ['Liver'],
    cancersFull: 'Signature 16 has been found in liver cancer',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 16 remains unknown',
    features: 'Signature 16 exhibits an extremely strong transcriptional strand bias for T>C mutations at ApTpN context, with T>C mutations occurring almost exclusively on the transcribed strand',
    comments: '',
  },
  // Signature 17
  {
    cancers: ['Oesophagus', 'Breast', 'Liver', 'Lung Adenocarcinoma', 'B-cell Lymphoma', 'Stomach', 'Melanoma'],
    cancersFull: 'Signature 17 has been found in oesophagus cancer, breast cancer, liver cancer, lung adenocarcinoma, B-cell lymphoma, stomach cancer and melanoma',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 17 remains unknown',
    features: '',
    comments: '',
  },
  // Signature 18
  {
    cancers: ['Breast', 'Stomach', 'Neuroblastoma'],
    cancersFull: 'Signature 18 has been found commonly in neuroblastoma. Additionally, Signature 18 has been also observed in breast and stomach carcinomas',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 18 remains unknown',
    features: '',
    comments: '',
  },
  // Signature 19
  {
    cancers: ['Pilocytic Astrocytoma'],
    cancersFull: 'Signature 19 has been found only in pilocytic astrocytoma',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 19 remains unknown',
    features: '',
    comments: '',
  },
  // Signature 20
  {
    cancers: ['Breast', 'Stomach'],
    cancersFull: 'Signature 20 has been found in stomach and breast cancers',
    aetiology: 'Defective DNA mismatch repair',
    aetiologyFull: 'Signature 20 is believed to be associated with defective DNA mismatch repair',
    features: 'Signature 20 is associated with high numbers of small (shorter than 3bp) insertions and deletions at mono/polynucleotide repeats',
    comments: 'Signature 20 is one of four mutational signatures associated with defective DNA mismatch repair and is often found in the same samples as Signatures 6, 15, and 26',
  },
  // Signature 21
  {
    cancers: ['Stomach'],
    cancersFull: 'Signature 21 has been found only in stomach cancer',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 21 remains unknown',
    features: '',
    comments: 'Signature 21 is found only in four samples all generated by the same sequencing centre. The mutational pattern of Signature 21 is somewhat similar to the one of Signature 26. Additionally, Signature 21 is found only in samples that also have Signatures 15 and 20. As such, Signature 21 is probably also related to microsatellite unstable tumours',
  },
  // Signature 22
  {
    cancers: ['Urothelial', 'Liver'],
    cancersFull: 'Signature 22 has been found in urothelial (renal pelvis) carcinoma and liver cancers',
    aetiology: 'Exposure to aristolochic acid',
    aetiologyFull: 'Signature 22 has been found in cancer samples with known exposures to aristolochic acid. Additionally, the pattern of mutations exhibited by the signature is consistent with the one previous observed in experimental systems exposed to aristolochic acid',
    features: 'Signature 22 exhibits a very strong transcriptional strand bias for T>A mutations indicating adenine damage that is being repaired by transcription-coupled nucleotide excision repair',
    comments: 'Signature 22 has a very high mutational burden in urothelial carcinoma; however, its mutational burden is much lower in liver cancers',
  },
  // Signature 23
  {
    cancers: ['Liver'],
    cancersFull: 'Signature 23 has been found only in a single liver cancer sample',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 23 remains unknown',
    features: 'Signature 23 exhibits very strong transcriptional strand bias for C>T mutations',
    comments: '',
  },
  // Signature 24
  {
    cancers: ['Liver'],
    cancersFull: 'Signature 24 has been observed in a subset of liver cancers',
    aetiology: 'Exposure to aflatoxin',
    aetiologyFull: 'Signature 24 has been found in cancer samples with known exposures to aflatoxin. Additionally, the pattern of mutations exhibited by the signature is consistent with that previous observed in experimental systems exposed to aflatoxin',
    features: 'Signature 24 exhibits a very strong transcriptional strand bias for C>A mutations indicating guanine damage that is being repaired by transcription-coupled nucleotide excision repair',
    comments: '',
  },
  // Signature 25
  {
    cancers: ['Hodgkin Lymphoma'],
    cancersFull: 'Signature 25 has been observed in Hodgkin lymphomas',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 25 remains unknown',
    features: 'Signature 25 exhibits transcriptional strand bias for T>A mutations',
    comments: 'This signature has only been identified in Hodgkin’s cell lines. Data is not available from primary Hodgkin lymphomas',
  },
  // Signature 26
  {
    cancers: ['Breast', 'Cervical', 'Stomach', 'Uterine'],
    cancersFull: 'Signature 26 has been found in breast cancer, cervical cancer, stomach cancer and uterine carcinoma',
    aetiology: 'Defective DNA mismatch repair',
    aetiologyFull: 'Signature 26 is believed to be associated with defective DNA mismatch repair',
    features: 'Signature 26 is associated with high numbers of small (shorter than 3bp) insertions and deletions at mono/polynucleotide repeats',
    comments: 'Signature 26 is one of four mutational signatures associated with defective DNA mismatch repair and is often found in the same samples as Signatures 6, 15 and 20',
  },
  // Signature 27
  {
    cancers: ['Kidney Clear Cell Carcinoma'],
    cancersFull: 'Signature 27 has been observed in a subset of kidney clear cell carcinomas',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 27 remains unknown',
    features: 'Signature 27 exhibits very strong transcriptional strand bias for T>A mutations. Signature 27 is associated with high numbers of small (shorter than 3bp) insertions and deletions at mono/polynucleotide repeats',
    comments: '',
  },
  // Signature 28
  {
    cancers: ['Stomach'],
    cancersFull: 'Signature 28 has been observed in a subset of stomach cancers',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 28 remains unknown',
    features: '',
    comments: '',
  },
  // Signature 29
  {
    cancers: ['Gingivo-buccal Oral Squamous Cell Carcinoma'],
    cancersFull: 'Signature 29 has been observed only in gingivo-buccal oral squamous cell carcinoma',
    aetiology: 'Tobacco (chewing)',
    aetiologyFull: 'Signature 29 has been found in cancer samples from individuals with a tobacco chewing habit',
    features: 'Signature 29 exhibits transcriptional strand bias for C>A mutations indicating guanine damage that is most likely repaired by transcription-coupled nucleotide excision repair. Signature 29 is also associated with CC>AA dinucleotide substitutions',
    comments: 'The Signature 29 pattern of C>A mutations due to tobacco chewing appears different from the pattern of mutations due to tobacco smoking reflected by Signature 4',
  },
  // Signature 30
  {
    cancers: ['Breast'],
    cancersFull: 'Signature 30 has been observed in a small subset of breast cancers',
    aetiology: 'Unknown',
    aetiologyFull: 'The aetiology of Signature 30 remains unknown',
    features: '',
    comments: '',
  },
];

export default signatures;
