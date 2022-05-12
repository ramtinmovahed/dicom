import csv
import pydicom
from pydicom.data import get_testdata_file

filename = get_testdata_file("CT_small.dcm")
ds = pydicom.dcmread(filename)

with open('my.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow("Group Elem Description VR value".split())
    for elem in ds:
        writer.writerow([
            f"{elem.tag.group:04X}", f"{elem.tag.element:04X}",
            elem.description(), elem.VR, str(elem.value)
        ])
