from asyncio.log import logger
import logging
import csv
import pydicom
import io
# from pydicom.data import get_testdata_file
import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    file = req.files.get('File')
    ds = pydicom.dcmread(file.stream)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow("Group Elem Description VR value".split())
    for elem in ds:
        writer.writerow([
            f"{elem.tag.group:04X}", f"{elem.tag.element:04X}",
            elem.description(), elem.VR, str(elem.value)
        ])
        # send csv data to client
    return func.HttpResponse(output.getvalue(), mimetype='text/csv')







