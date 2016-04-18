from django.core.files import uploadhandler
from md5s3stash import md5s3stash
from public_interface import settings

class Md5s3stashUploadHandler(uploadhandler.FileUploadHandler): 
    def receive_data_chunk(self, raw_data, start):
        return raw_data
    
    def file_complete(self, file_size):
        url = "file:///" + settings.MEDIA_ROOT + "/uploads/" + self.file_name
        report = md5s3stash(url, "s3://static.ucldc.cdlib.org/harvested_images/")
        
        print report
        
        return None