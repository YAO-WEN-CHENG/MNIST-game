# MNIST model Training

- Train the model to be deployed in web page.
- Convert the model to onnx format.

## Installation

- Need pytorch, PyYAML, tqdm to run scripts in this folder.

```
pip install -r requirements.txt
```

## Training

- It will store ckpts for each epoch.

```
python train.py
```

## Convert

- Copy the path of ckpt to convert to onnx.

```
# Configure filename to match yours.
python convert.py -c <checkpoint_filename.pt> -o <output_filename.onnx>
```
