# LoRA and PEFT

## What is PEFT?

**PEFT (Parameter-Efficient Fine-Tuning)** is a group of techniques used to adapt a pretrained model without updating all of its parameters. Instead of performing full fine-tuning, PEFT trains only a small number of additional parameters, which reduces memory usage, computation, and training cost.

## What is LoRA?

**LoRA (Low-Rank Adaptation)** is one of the most commonly used PEFT techniques. In LoRA, the original model weights are kept **frozen**, while small trainable low-rank matrices are added to selected layers. During training, only these adapter matrices are updated rather than the billions of parameters in the original model.

## What does `r` control?

The `r` parameter in `LoraConfig` represents the **rank** of the low-rank matrices used by LoRA.

```python
config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
    bias="none",
)
```

A **smaller `r`** means fewer trainable parameters, so training requires less memory and computation, but the adapter has less capacity to learn complex changes.

A **larger `r`** gives the adapter more capacity to learn, but it also increases the number of trainable parameters, memory usage, and computational cost.

## What does `target_modules` control?

`target_modules` specifies **which layers of the model receive the LoRA adapters**.

For example:

```python
target_modules=["q_proj", "v_proj"]
```

means that LoRA adapters are added to the query and value projection layers of the attention mechanism. Selecting fewer target modules reduces the number of trainable parameters, while selecting more modules allows LoRA to modify more parts of the model.

## Why is LoRA cheaper than full fine-tuning?

In full fine-tuning, the parameters of the entire pretrained model are updated, which can require a large amount of GPU memory and computational resources. LoRA keeps the original model frozen and trains only small adapter matrices. Therefore, LoRA can significantly reduce the number of trainable parameters, making model adaptation more practical on limited hardware.

## LoRA vs Full Fine-Tuning

| Aspect                        | Full Fine-Tuning | LoRA           |
| ----------------------------- | ---------------- | -------------- |
| Base model weights            | Updated          | Frozen         |
| Trainable parameters          | Very large       | Small          |
| Memory requirement            | High             | Lower          |
| Training cost                 | High             | Lower          |
| Training speed                | Usually slower   | Usually faster |
| Adapter parameters            | Not used         | Used           |
| Suitable for limited hardware | Difficult        | More practical |

## Relationship Between PEFT and LoRA

The relationship can be summarized as:

```text
PEFT
│
├── LoRA
├── Prefix Tuning
├── Adapter-based methods
└── Other parameter-efficient techniques
```

**PEFT is the broader concept/family, while LoRA is one specific technique within PEFT.**

For this project, the important idea is that **quantization helps make an already-trained model cheaper to run, while PEFT/LoRA helps make adapting that model cheaper to train.**
